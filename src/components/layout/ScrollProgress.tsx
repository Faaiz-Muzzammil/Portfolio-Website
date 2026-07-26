"use client";

import { m, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Reading progress as a hairline along the top edge, at every width.
 *
 * It used to switch off above 1440px, where the route rail took over. The
 * rail is gone — between it, the nav bar's active marker and this, three
 * separate things were answering "where am I" — so this one runs everywhere.
 *
 * IT IS NOT GRAINED, and that is a performance decision rather than a design
 * one. It wore `.live-mark` like every other genuinely-live thing on the
 * site, which meant a `mix-blend-mode` layer running an infinite animation,
 * stretched across the full width of the viewport, pinned above every other
 * element on the page, and transforming on every scroll frame. A blended
 * element cannot be composited on its own: the browser has to read back
 * everything painted beneath it and re-blend, and here "beneath it" was the
 * entire page. It was the single most expensive object on the site, and it
 * was two pixels tall — at that height the grain resolves to a flat wash
 * anyway, so the whole cost bought a texture nobody could see.
 */
export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const reduce = useReducedMotion();

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 180,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <m.div
            aria-hidden
            style={{ scaleX: reduce ? scrollYProgress : scaleX }}
            className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-ink"
        />
    );
}
