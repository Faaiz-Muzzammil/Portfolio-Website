"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/cn";

type CounterProps = {
    value: number;
    prefix?: string;
    suffix?: string;
    className?: string;
};

/**
 * Counts up when it first scrolls into view. NumberFlow handles the digit
 * transitions — each place rolls independently, which reads far better than
 * a text node being re-rendered 60 times a second.
 */
export default function Counter({
    value,
    prefix = "",
    suffix = "",
    className,
}: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);

    /* WHAT THIS TRACKS IS "HAS IT BEEN SEEN", NOT "WHAT NUMBER IS SHOWN".
       It used to hold the displayed figure and assign `value` into it from
       two places — once from the observer, and once synchronously in the
       effect body when reduced motion was set. That second assignment was a
       state write during an effect, which costs a second render pass before
       the browser paints, and it duplicated as state something that is
       derived: the number on screen is a pure function of the media query
       and whether the element has been scrolled to.

       Reduced motion now comes from framer-motion's `useReducedMotion`,
       which subscribes to the media query properly and is already a
       dependency — so a visitor who flips the OS setting while the page is
       open gets the right behaviour instead of whatever was true at mount. */
    const reduce = useReducedMotion();
    const [seen, setSeen] = useState(false);

    /* Reduced motion skips the count entirely and prints the final figure;
       otherwise it rests at zero until the span is genuinely in view. */
    const display = reduce || seen ? value : 0;

    useEffect(() => {
        if (reduce || seen) return;

        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setSeen(true);
                observer.disconnect();
            },
            { threshold: 0.4 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [reduce, seen]);

    return (
        <span ref={ref} className={cn("tnum inline-flex items-baseline", className)}>
            {prefix}
            <NumberFlow
                value={display}
                transformTiming={{ duration: 1100, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                spinTiming={{ duration: 1100, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                willChange
            />
            {suffix}
        </span>
    );
}
