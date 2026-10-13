"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { GROW, grow, type Tree } from "@/lib/branch";

/* ---- THE COVER'S BRANCH ------------------------------------------
 *
 * A branch grows out of the photograph's right edge and fans across the
 * grained panel beside it. The geometry is `grow` in `lib/branch.ts`,
 * shared with the contact piece.
 *
 * Two shapes of one tree, because the panel has two shapes: 4:5 on a
 * phone, and a tall column at `lg` that runs the height of the cover.
 * Colours come from `.hero-panel` in `globals.css`.
 * ------------------------------------------------------------------ */

const WIDE = grow(160, 200, [-0.9, -0.45, 0, 0.45, 0.9]);
const TALL = grow(160, 320, [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2]);

function Branch({ tree, className }: { tree: Tree; className: string }) {
    const ref = useRef<SVGSVGElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const reduce = useReducedMotion();
    const shown = inView || !!reduce;

    return (
        <svg
            ref={ref}
            aria-hidden
            className={`hero-branch absolute inset-0 h-full w-full ${className}`}
            viewBox={`0 0 ${tree.w} ${tree.h}`}
            preserveAspectRatio="xMinYMid meet"
            fill="none"
            strokeLinecap="round"
        >
            {tree.limbs.map((l, i) => (
                <m.path
                    key={i}
                    d={l.d}
                    strokeWidth={l.width}
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={shown ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{
                        pathLength: { duration: GROW, delay: l.delay, ease: [0.33, 0, 0.2, 1] },
                        opacity: { duration: 0.01, delay: l.delay },
                    }}
                />
            ))}

            {tree.buds.map((b, i) => (
                <m.circle
                    key={i}
                    className="hero-branch__bud"
                    cx={b.at.x}
                    cy={b.at.y}
                    r={1.2}
                    initial={reduce ? false : { opacity: 0, scale: 0 }}
                    animate={shown ? { opacity: 1, scale: 1 } : undefined}
                    transition={{ duration: 0.4, delay: b.delay, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
            ))}
        </svg>
    );
}

/* Both shapes render; the breakpoint shows one. The hidden one never
   enters view, so it never animates. */
export default function HeroBranch() {
    return (
        <>
            <Branch tree={WIDE} className="lg:hidden" />
            <Branch tree={TALL} className="hidden lg:block" />
        </>
    );
}
