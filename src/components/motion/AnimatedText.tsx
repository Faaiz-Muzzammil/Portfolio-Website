"use client";

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@/hooks/use-gsap";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

type AnimatedTextProps = {
    as?: ElementType;
    /** "lines" for headlines, "words" for leads, "chars" for short labels. */
    split?: "lines" | "words" | "chars";
    delay?: number;
    stagger?: number;
    /** Start the reveal immediately instead of on scroll — for above-the-fold. */
    immediate?: boolean;
    /** For `aria-labelledby` on the parent section. */
    id?: string;
    className?: string;
    children: ReactNode;
};

/**
 * Masked split-text reveal. Each line/word sits inside an overflow-hidden
 * wrapper and slides up from below its own baseline, which reads far more
 * deliberate than a plain opacity fade.
 *
 * SplitText ships free with GSAP 3.13+, so no separate Club licence.
 */
export default function AnimatedText({
    as: Tag = "div",
    split = "lines",
    delay = 0,
    stagger,
    immediate = false,
    id,
    className,
    children,
}: AnimatedTextProps) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const el = ref.current;
            if (!el) return;

            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduce) {
                el.setAttribute("data-ready", "");
                return;
            }

            gsap.registerPlugin(ScrollTrigger, SplitText);

            const instance = new SplitText(el, {
                type: split,
                linesClass: "line-inner",
                wordsClass: split === "words" ? "line-inner" : undefined,
                charsClass: split === "chars" ? "line-inner" : undefined,
                // Wrap each line in its own mask so the slide is clipped.
                mask: split === "lines" ? "lines" : undefined,
            });

            const targets =
                split === "lines"
                    ? instance.lines
                    : split === "words"
                        ? instance.words
                        : instance.chars;

            el.setAttribute("data-ready", "");

            const defaultStagger =
                split === "chars" ? 0.02 : split === "words" ? 0.035 : 0.09;

            /* Far enough below the mask to be genuinely out of it. The mask
               is 0.26em taller than the line it clips — that is the room the
               descenders need — so a line parked at 108% of its own height
               still has its top 0.18em showing through the bottom of the box
               before the tween starts. 130% clears the extended mask with
               margin. Words and chars are not masked and keep the shorter
               travel; a bigger movement there is just a bigger movement. */
            const enterFrom = split === "lines" ? 130 : 108;

            gsap.fromTo(
                targets,
                { yPercent: enterFrom, opacity: 0 },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.95,
                    ease: EASE_OUT,
                    delay,
                    stagger: stagger ?? defaultStagger,
                    ...(immediate
                        ? {}
                        : {
                            scrollTrigger: {
                                trigger: el,
                                start: "top 88%",
                                once: true,
                            },
                        }),
                },
            );

            // The context reverts the tween; SplitText has to be undone by hand
            // or the split <span> wrappers stay in the DOM.
            return () => instance.revert();
        },
        { dependencies: [split, delay, stagger, immediate] },
    );

    /* createElement rather than <Tag>: @react-three/fiber augments
       JSX.IntrinsicElements, which collapses polymorphic `as` prop
       resolution to `never`. */
    return createElement(
        Tag,
        { ref, id, "data-animate": "lines", className: cn(className) },
        children,
    );
}
