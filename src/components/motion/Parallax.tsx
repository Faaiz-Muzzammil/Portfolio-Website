"use client";

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@/hooks/use-gsap";

type ParallaxProps = {
    as?: ElementType;
    /**
     * How far this layer drifts as its section scrolls away, as a fraction of
     * the viewport height. Depth is the whole point: two layers at the same
     * figure are not parallax, they are one layer in two pieces.
     */
    depth?: number;
    /** Fade over the same distance, so the layer recedes rather than slides. */
    fade?: boolean;
    className?: string;
    children: ReactNode;
};

/**
 * A layer that leaves the screen slightly faster than the page does.
 *
 * The effect is depth, and depth is a difference — so this is only ever worth
 * using twice or more on the same section, at different figures. The cover
 * runs the sentence at 0.14 and the paragraph and buttons at 0.07: the type
 * pulls away from the copy beneath it as the section exits, which is what
 * makes the flat page read as having a near and a far.
 *
 * It is kept deliberately small. Half a screen of drift is a slideshow; a
 * seventh of one is a thing you feel rather than watch.
 *
 * WHY IT WRAPS RATHER THAN ANIMATES ITS CHILD. The elements underneath carry
 * the load-in animations, which are CSS, and a CSS animation with `both` fill
 * beats an inline transform for the rest of the session. GSAP writing to the
 * same element would silently lose. The wrapper is untouched by CSS, so the
 * two systems never address the same node.
 *
 * `scrub` ties the tween to scroll position rather than to time, and the 0.5
 * gives it half a second of catch-up so a trackpad flick eases out instead of
 * snapping. `invalidateOnRefresh` re-reads the viewport height on resize,
 * which is why the distance is a function rather than a number.
 *
 * Two shapes here are deliberate and should not be "tidied", for the same
 * reason they are deliberate in `use-gsap`:
 *   1. `props` is not destructured in the signature. A destructured-default
 *      parameter anywhere in this component makes SWC hoist a temp for `??`
 *      used inside the effect closure without declaring it — `_el_closest is
 *      not defined`, thrown at runtime, invisible to the type checker.
 *   2. For the same reason the trigger is resolved with an `if`, not with
 *      `??`, and the tween vars are assembled by assignment rather than by
 *      a conditional spread.
 */
export default function Parallax(props: ParallaxProps) {
    const Tag = props.as ? props.as : "div";
    const depth = props.depth === undefined ? 0.1 : props.depth;
    const fade = props.fade === true;
    const className = props.className;
    const children = props.children;

    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const el = ref.current;
            if (!el) return;

            gsap.registerPlugin(ScrollTrigger);

            /* The section, not the layer — every layer in a section has to be
               driven by the same stretch of scroll or they drift apart
               instead of together. */
            const section = el.closest("section");
            const trigger = section ? section : el;

            /* `gsap.matchMedia` rather than a one-off check at mount, so both
               conditions are live: rotate a tablet or turn reduced motion on
               in system settings and the tween is built or torn down and its
               transforms cleaned off the element, with no reload.

               Under 768px it does not run at all. A phone's viewport is
               barely shorter than the section, so the drift has almost no
               scroll distance to happen over — it costs a scrubbed tween per
               layer, on the least powerful hardware there is, and buys a few
               pixels of movement nobody can see on a 6in screen. */
            const mm = gsap.matchMedia();

            mm.add(
                "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
                () => {
                    const vars: gsap.TweenVars = {
                        y: () => -depth * window.innerHeight,
                        ease: "none",
                        scrollTrigger: {
                            trigger,
                            start: "top top",
                            end: "bottom top",
                            scrub: 0.5,
                            invalidateOnRefresh: true,
                        },
                    };

                    if (fade) vars.opacity = 0.1;

                    gsap.to(el, vars);
                },
            );

            return () => mm.revert();
        },
        { dependencies: [depth, fade] },
    );

    /* createElement rather than <Tag>: @react-three/fiber augments
       JSX.IntrinsicElements, which collapses polymorphic `as` prop
       resolution to `never`. */
    return createElement(Tag, { ref, className }, children);
}
