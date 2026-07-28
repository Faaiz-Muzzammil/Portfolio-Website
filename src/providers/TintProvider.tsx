"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    useMotionValueEvent,
    useScroll,
    useTransform,
    type MotionValue,
} from "framer-motion";

import { SECTION_IDS } from "@/lib/sections";

/**
 * The one colour on the site, computed once and read by everything that
 * carries it.
 *
 * WHAT IT IS. Each department has a deep ink of its own. As the page is
 * scrolled the two margins and the ground behind the measure crossfade from
 * one to the next, continuously, reaching a section's colour when that
 * section's centre reaches the centre of the viewport.
 *
 * WHY A PROVIDER RATHER THAN A HOOK EACH. Three things read this — the left
 * rail, the right rail, and the page ground — and they have to agree exactly.
 * Three copies of the computation would each carry their own spring, and three
 * springs fed the same input do not produce the same output: they are separate
 * integrators started at slightly different times, and they settle at slightly
 * different rates. The visible failure is the margins reaching a colour a
 * frame before the page behind them, which reads as a seam down each side of
 * the measure at exactly the moment the eye is on it.
 *
 * ---- WHAT THIS COSTS PER FRAME, WHICH IS THE WHOLE DESIGN ---------------
 *
 * Everything below is shaped by one constraint: the page has to stay smooth
 * while it scrolls. Three versions of this feature were too slow, and each was
 * slow for a different reason worth writing down.
 *
 * IT DOES NOT INTERPOLATE THE COLOUR. The first version mixed the two
 * neighbouring inks into a single value and wrote it to `background-color`
 * every frame. `background-color` is not compositable — changing it
 * invalidates the element and forces a repaint — so that asked for a
 * full-viewport repaint plus two full-height ones, sixty times a second, on
 * top of whatever the scroll was already doing.
 *
 * So the colour is painted, never computed. Each ink goes into a layer that
 * never changes, and scrolling only animates `opacity`, which the compositor
 * does on the GPU without waking the main thread.
 *
 * IT DRAWS TWO LAYERS, NOT ONE PER SECTION. The second version stacked all
 * five and cross-faded the whole pile. That is correct and it is still too
 * much: five layers in each of three places is fifteen composited surfaces,
 * most of them the size of the viewport, blended on every frame forever.
 * Only ever two of them can be visible at once — the one you are leaving and
 * the one you are arriving at — so that is all that is rendered. `segment`
 * says which pair, and it changes four times in a full read of the page
 * rather than sixty times a second.
 *
 * IT USES NO MASKS. The third version shaped the colour with `mask-image`,
 * which forces every masked element into its own render surface and re-applies
 * the mask whenever anything inside it changes — which, with an opacity
 * animating inside, is every frame. The shapes are baked into each layer's own
 * gradient instead, off `currentColor`, so they cost one paint at mount and
 * nothing afterwards. See `globals.css`.
 *
 * What is left is: one spring, two opacity values, and six elements that do
 * nothing but change opacity.
 *
 * ---- THE STOPS ---------------------------------------------------------
 *
 * A section's colour is fully reached when its centre reaches the centre of
 * the viewport, so the stops are measured — the five sections are nowhere near
 * equal in height, and an even split puts every crossover in the wrong place,
 * most visibly around the cover, which is the shortest of them.
 *
 * The first and last are pinned to 0 and 1 rather than measured. Nothing can
 * scroll above the top of the page or below the bottom of it, so a measured
 * stop for either would be unreachable, and the practical result is that the
 * contact form never quite arrives at its own colour.
 *
 * MEASURING IS rAF-DEBOUNCED AND GUARDED ON THE PAGE'S DIMENSIONS, which
 * matters more than it looks. The observer is on `document.body` and the page
 * is full of scroll-triggered reveals, so it fires repeatedly *during* the
 * scroll — and every one of those used to run five `getBoundingClientRect`
 * calls and could publish new state, re-rendering the tree mid-gesture. Now a
 * burst of mutations collapses into one measurement on the next frame, and
 * that measurement returns immediately unless the document or the viewport
 * actually changed size.
 *
 * It is still a ResizeObserver and not a resize listener, for the reason
 * `useActiveSection` sets out at length: its callback runs after layout has
 * been computed, so the reads are free, and it catches every real cause of the
 * page changing height — a reveal firing, a webfont swapping, a rotation —
 * which a resize listener would not.
 *
 * AND IT TELLS REACT AS LITTLE AS POSSIBLE. Everything that happens on every
 * frame happens in motion values, which write to the DOM directly. React hears
 * about the segment changing — four times in a full read of the page — and
 * about a genuine resize, and nothing else. The two notes further down, on the
 * segment handler and on the measurement, are the two places that was easy to
 * get wrong, and both of them were.
 */

type Tint = {
    /**
     * Which pair of sections the reader is currently between. The colour below
     * is `SECTION_IDS[segment]`, the one fading in over it is `segment + 1`.
     */
    segment: number;
    /** How far through that pair, 0 to 1. The only thing that moves. */
    blend: MotionValue<number>;
};

const TintContext = createContext<Tint | null>(null);

/* What the stops are before the first measurement — an even split, which is
   wrong but is wrong in a way nobody sees. It holds for the one frame between
   mount and the effect below, and it is also what the server renders. */
const EVEN = SECTION_IDS.map((_, i) => i / (SECTION_IDS.length - 1));

/* Enough of a gap between two stops that framer-motion is never handed a
   zero-width segment to divide by. */
const EPSILON = 0.001;

const LAST = SECTION_IDS.length - 2;

export function TintProvider({ children }: { children: ReactNode }) {
    const { scrollYProgress } = useScroll();

    const [stops, setStops] = useState<number[]>(EVEN);
    const [segment, setSegment] = useState(0);

    /* The dimensions the current stops were measured against. The observer
       fires on every reveal and every font swap; almost none of those change
       the page's height, and re-measuring for them is pure waste. */
    const measuredAt = useRef({ height: 0, viewport: 0 });

    useEffect(() => {
        let frame = 0;

        const measure = () => {
            frame = 0;

            const height = document.documentElement.scrollHeight;
            const viewport = window.innerHeight;

            if (
                height === measuredAt.current.height &&
                viewport === measuredAt.current.viewport
            ) {
                return;
            }

            const scrollable = height - viewport;

            /* A page shorter than the viewport has no scroll to map onto.
               Nothing to do, and the even split is as good an answer as any. */
            if (scrollable <= 0) return;

            const half = viewport / 2;
            const raw: number[] = [];

            for (const id of SECTION_IDS) {
                const el = document.getElementById(id);
                /* A section that is not on this page — bail entirely rather
                   than publish a short array, which would leave the stops and
                   the colours different lengths. */
                if (!el) return;

                const rect = el.getBoundingClientRect();
                const centre = rect.top + window.scrollY + rect.height / 2;
                raw.push((centre - half) / scrollable);
            }

            measuredAt.current = { height, viewport };

            /* The walk that guarantees a strictly increasing range. The ends
               are pinned; each middle stop is held at least EPSILON above the
               one before it and at least EPSILON per remaining stop below 1,
               so the floor can never climb past the ceiling and no two stops
               can ever land on the same value — either of which would hand
               `useTransform` a range it cannot interpolate across. */
            const n = raw.length;
            const next = new Array<number>(n);

            next[0] = 0;
            next[n - 1] = 1;

            for (let i = 1; i < n - 1; i++) {
                const floor = next[i - 1] + EPSILON;
                const ceiling = 1 - EPSILON * (n - 1 - i);
                next[i] = Math.min(Math.max(raw[i], floor), ceiling);
            }

            setStops((current) =>
                current.every((v, i) => Math.abs(v - next[i]) < 0.002)
                    ? current
                    : next,
            );
        };

        /* One measurement per frame at most, however many mutations arrive. */
        const schedule = () => {
            if (frame === 0) frame = requestAnimationFrame(measure);
        };

        measure();

        const observer = new ResizeObserver(schedule);
        observer.observe(document.body);

        return () => {
            if (frame !== 0) cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);

    /* Which pair we are between.
       ------------------------------------------------------------------
       This handler runs on every frame of every scroll, so what it does
       *not* do matters more than what it does.

       IT DOES NOT CALL setState UNLESS THE SEGMENT ACTUALLY CHANGED, and the
       comparison is against a ref rather than against the state value. The
       obvious form — `setSegment(current => current === next ? current : next)`
       — looks like it costs nothing when the answer is unchanged, and it does
       not: React still has to enter the update path and schedule work to
       discover that it can bail out. Doing that sixty times a second, on the
       main thread, during a scroll, is a stutter you can see. The ref means
       React hears from this four times in a full read of the page.

       THERE IS NO SPRING ON THE SCROLL VALUE either, and there was. It bought
       a slight lag that made a fast flick resolve as one blend rather than
       several, which is a real improvement and not worth what it costs: a
       spring is a continuous animation loop that keeps running after the
       scroll has stopped, driving this handler and every downstream transform
       with it. A crossfade that already takes a whole section to happen does
       not need smoothing. */
    const segmentRef = useRef(0);

    useMotionValueEvent(scrollYProgress, "change", (value) => {
        let next = 0;
        for (let i = 0; i <= LAST; i++) {
            if (value >= stops[i]) next = i;
        }

        if (next === segmentRef.current) return;

        segmentRef.current = next;
        setSegment(next);
    });

    const blend = useTransform(
        scrollYProgress,
        [stops[segment], stops[segment + 1]],
        [0, 1],
    );

    return (
        <TintContext.Provider value={{ segment, blend }}>
            {children}
        </TintContext.Provider>
    );
}

export function useTint(): Tint {
    const value = useContext(TintContext);

    if (value === null) {
        throw new Error("useTint must be used inside <TintProvider>.");
    }

    return value;
}
