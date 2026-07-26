"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Document-level mount housekeeping. Three jobs, none of them scrolling.
 *
 * Scrolling itself is the browser's. This used to run Lenis on GSAP's ticker
 * to give the page eased, weighted scrolling. It is gone: the wheel now maps
 * straight to the document, which is faster to first interaction, one
 * dependency lighter, and exactly what a visitor's own scroll settings
 * already do.
 *
 *   SCROLLTRIGGER  Registered once for the whole document and refreshed
 *                  twice: after mount, so the scroll-triggered reveals
 *                  resolve rather than sitting at opacity 0, and again once
 *                  the webfonts have swapped in, because every start position
 *                  measured before that was measured against a fallback face
 *                  of a different width.
 *
 *   THE GATE       An inline script in `layout.tsx` puts `js-loading` on the
 *                  root before the page is parsed, which pins the cover's
 *                  entrance to its first frame. This lifts it — but only once
 *                  `document.fonts.ready` has resolved, so the sequence runs
 *                  when the page is on screen and set in Manrope rather than
 *                  in whatever the fallback was. A CSS animation counts from
 *                  parse time, and on a cold load that is well before anyone
 *                  is looking.
 *
 *                  The script's own 2.5s timer is the real failsafe, so a
 *                  bundle that never arrives cannot leave the cover blank.
 *                  The timer here is only to keep a font that never resolves
 *                  from holding the gate for the full 2.5.
 *
 *   BFCACHE        A back-button restore re-shows the document without
 *                  re-parsing it, so no CSS animation replays and the visitor
 *                  gets the finished cover with none of the arrival. Re-arming
 *                  the class and dropping it two frames later restarts the
 *                  whole sequence from its own delays. Two frames, not one:
 *                  the first commits the pinned state, the second releases it,
 *                  and a single frame can coalesce the two into no change at
 *                  all.
 */
export default function ScrollProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        const root = document.documentElement;

        root.classList.remove("no-js");

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.refresh();

        let timer = 0;

        const play = () => {
            window.clearTimeout(timer);
            root.classList.remove("js-loading");

            /* The refresh above ran against the fallback font. Manrope and
               Instrument Sans are both narrower than what the browser
               substitutes for them, so every element on the page sits a
               little higher once they swap in — and every ScrollTrigger start
               position measured before that is wrong by the difference. The
               visible symptom is reveals firing late, or firing all at once
               halfway down the page. Re-measuring here, at the one moment we
               know the real metrics are in, is what keeps them honest. */
            ScrollTrigger.refresh();
        };

        const fonts = document.fonts;

        if (fonts && fonts.status !== "loaded") {
            timer = window.setTimeout(play, 1200);
            /* Settled either way — a font that fails to load is still a page
               that has to show its cover. */
            fonts.ready.then(play, play);
        } else {
            play();
        }

        const onPageShow = (event: PageTransitionEvent) => {
            if (!event.persisted) return;
            root.classList.add("js-loading");
            requestAnimationFrame(() => requestAnimationFrame(play));
        };

        window.addEventListener("pageshow", onPageShow);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("pageshow", onPageShow);
        };
    }, []);

    return <>{children}</>;
}
