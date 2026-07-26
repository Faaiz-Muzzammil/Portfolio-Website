"use client";

import { useEffect, useRef, useState } from "react";
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
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setDisplay(value);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setDisplay(value);
                observer.disconnect();
            },
            { threshold: 0.4 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [value]);

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
