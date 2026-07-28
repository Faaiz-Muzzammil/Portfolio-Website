"use client";

import { useEffect } from "react";

import { SECTION_IDS } from "@/lib/sections";
import { useActiveSection } from "@/hooks/use-active-section";

/**
 * Puts the current department's name on the root element. That is the whole
 * of the JavaScript in the colour system.
 *
 * ── WHY IT IS THIS SMALL ──────────────────────────────────────────────
 *
 * This began as a scroll-linked crossfade: the colour was interpolated
 * continuously from the scroll position, so the margins warmed through from
 * one ink to the next as you read rather than changing at a threshold. It
 * looked better than this does. It went through three rewrites trying to
 * make it affordable and never became affordable, and the reason is
 * structural rather than a matter of tuning.
 *
 * Anything driven by scroll position has to do work on every frame of every
 * scroll, and the work here is on surfaces the size of the viewport. Each
 * version moved the cost somewhere else rather than removing it:
 *
 *   · interpolating the ink and writing `background-color` repainted a
 *     full-viewport layer and two full-height ones, sixty times a second —
 *     `background-color` is not a compositable property;
 *   · stacking one static layer per department and cross-fading their
 *     opacities fixed the repaint and left twelve composited surfaces, four
 *     of them viewport-sized, blended on every frame forever;
 *   · promoting those with `will-change` made each frame cheaper and cost
 *     roughly thirty megabytes of permanently held compositor memory, which
 *     is where the stutter got worse rather than better;
 *   · drawing only the two inks that can be visible at once halved the
 *     layers and introduced a flicker, because the colour is written by
 *     React on commit and the opacity by framer on its own loop, and at a
 *     boundary those two writes can land a frame apart.
 *
 * The version that is actually fast does no per-frame work at all. The
 * colour changes at a threshold and CSS transitions it, so scrolling costs
 * nothing and the only expense is one bounded repaint per boundary — four
 * times in a full read of the page, against sixty times a second.
 *
 * WHAT WAS TRADED. The blend is no longer tied to scroll position, so it no
 * longer tracks the reader's velocity: fling past three sections and you get
 * three transitions rather than one long one. In exchange the page scrolls
 * smoothly, which is worth more than a gradient nobody was able to enjoy.
 *
 * ── WHY IT REUSES `useActiveSection` ──────────────────────────────────
 *
 * The threshold has to be decided somewhere, and this hook already decides
 * it for the nav's active marker — an IntersectionObserver against a band
 * across the middle of the viewport, with no scroll handler in the common
 * case. Measuring section offsets separately, as the old provider did with
 * its own ResizeObserver, meant two systems answering "which section is
 * this" and the standing risk that they would disagree by a few pixels at
 * exactly the moment both were visible.
 *
 * IT RENDERS NOTHING. An attribute on the root is the smallest possible
 * interface between "which section" and "what colour", and it puts the
 * entire mapping in the stylesheet where the inks already live.
 */
export default function TintController() {
    const active = useActiveSection(SECTION_IDS);

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.tint = active;

        /* Cleared on unmount so a route change cannot leave the margins
           painted in the colour of a section that is no longer on screen. */
        return () => {
            delete root.dataset.tint;
        };
    }, [active]);

    return null;
}
