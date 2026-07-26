"use client";

import { useRef, type ReactNode } from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

type MagneticProps = {
    /** How far the element chases the cursor, in px. */
    strength?: number;
    /** Inner content lags slightly behind the wrapper for a parallax feel. */
    innerStrength?: number;
    className?: string;
    children: ReactNode;
};

/**
 * Cursor-attracted wrapper. The element drifts toward the pointer while it's
 * inside, and springs home on leave.
 *
 * Pointer-type gated: on touch there is no hover, and the effect would fire
 * once on tap and stick.
 */
export default function Magnetic({
    strength = 0.35,
    innerStrength = 0.16,
    className,
    children,
}: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const spring = { stiffness: 260, damping: 18, mass: 0.6 };
    const sx = useSpring(x, spring);
    const sy = useSpring(y, spring);

    const innerX = useTransform(sx, (v) => v * (innerStrength / strength));
    const innerY = useTransform(sy, (v) => v * (innerStrength / strength));

    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce || e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <m.div
            ref={ref}
            onPointerMove={handleMove}
            onPointerLeave={reset}
            style={{ x: sx, y: sy }}
            className={className}
        >
            <m.div style={{ x: innerX, y: innerY }}>{children}</m.div>
        </m.div>
    );
}
