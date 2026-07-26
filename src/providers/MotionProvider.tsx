"use client";

import { LazyMotion, domAnimation } from "framer-motion";
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
 */
export function MotionProvider({ children }: MotionProviderProps) {
    return (
        <LazyMotion features={domAnimation} strict>
            {children}
        </LazyMotion>
    );
}
