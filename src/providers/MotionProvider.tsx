"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { ReactNode } from "react";

interface MotionProviderProps {
    children: ReactNode;
}

/**
 * LazyMotion provider for reduced bundle size.
 * Uses domAnimation which includes only essential features:
 * - animate, whileHover, whileTap, whileFocus, whileInView
 * - exit animations with AnimatePresence
 *
 * This can reduce framer-motion bundle by ~60%
 *
 * `reducedMotion="user"` drops transform animations (presses, rises,
 * the sent plane) for anyone with `prefers-reduced-motion` set, while
 * keeping opacity — so state still changes visibly, it just doesn't move.
 */
export function MotionProvider({ children }: MotionProviderProps) {
    return (
        <LazyMotion features={domAnimation} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    );
}
