"use client";

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@/hooks/use-gsap";
import { EASE_OUT } from "@/lib/motion";

type RevealProps = {
    as?: ElementType;
    delay?: number;
    y?: number;
    /** Stagger direct children instead of animating the wrapper as one block. */
    stagger?: number;
    /** Also scale slightly — used for cards and imagery. */
    scale?: boolean;
    className?: string;
    children: ReactNode;
};

/**
 * Scroll-triggered entrance for anything that isn't text.
 * Reduced motion is resolved here, once, rather than per section.
 */
export default function Reveal({
    as: Tag = "div",
    delay = 0,
    y = 28,
    stagger,
    scale = false,
    className,
    children,
}: RevealProps) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const el = ref.current;
            if (!el) return;

            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduce) {
                el.setAttribute("data-ready", "");
                gsap.set(el, { clearProps: "all" });
                return;
            }

            gsap.registerPlugin(ScrollTrigger);

            const targets = stagger !== undefined ? Array.from(el.children) : el;
            if (stagger !== undefined) gsap.set(el, { opacity: 1 });
            el.setAttribute("data-ready", "");

            gsap.fromTo(
                targets,
                { opacity: 0, y, ...(scale ? { scale: 0.98 } : {}) },
                {
                    opacity: 1,
                    y: 0,
                    ...(scale ? { scale: 1 } : {}),
                    duration: 1,
                    ease: EASE_OUT,
                    delay,
                    stagger,
                    scrollTrigger: { trigger: el, start: "top 88%", once: true },
                },
            );
        },
        { dependencies: [delay, y, stagger, scale] },
    );

    /* createElement rather than <Tag>: @react-three/fiber augments
       JSX.IntrinsicElements, which collapses polymorphic `as` prop
       resolution to `never`. */
    return createElement(
        Tag,
        { ref, "data-animate": "fade", className },
        children,
    );
}
