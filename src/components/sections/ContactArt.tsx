"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/* ---- THE CONTACT PIECE -------------------------------------------
 *
 * The left of Contact is a root system drawn as it grows: one seed at
 * the top, roots pushing down and splitting, and at the end of each a
 * word — the things the rest of the work grows out of. Each tier waits
 * for its parent to arrive before it starts, so the piece reads as one
 * thing spreading rather than lines appearing.
 *
 * Ten words in three tiers, set on an even grid so no two labels crowd
 * each other. A root leaves from *below* its parent's word rather than
 * from its node, so no line ever runs through a label, and the bends
 * are kept gentle enough to read as growth, not scribble. There are no
 * rootlets: at this spacing they read as stray marks, not texture.
 *
 * The geometry is generated once, at module load, from a fixed seed, so
 * server and client draw the same roots and every visit sees the same
 * tree. The panel, the grain and the colours are `.contact-art` in
 * `globals.css`.
 * ------------------------------------------------------------------ */

type Pt = { x: number; y: number };

type Thought = { id: string; word: string; at: Pt; tier: number; parent?: string };

/* Three tiers, 140 apart. Marketing spreads down the left, software
   down the right, product drops straight through the middle. Labels
   are centred on their nodes and spaced so the widest of them clears
   its neighbours. Coordinates are in the 400×460 box. */
const TIERS = [130, 270, 410];

const THOUGHTS: Thought[] = [
    { id: "marketing", word: "marketing", at: { x: 78, y: TIERS[0] }, tier: 1 },
    { id: "product", word: "product", at: { x: 200, y: TIERS[0] }, tier: 1 },
    { id: "software", word: "software", at: { x: 322, y: TIERS[0] }, tier: 1 },
    { id: "brand", word: "brand", at: { x: 56, y: TIERS[1] }, tier: 2, parent: "marketing" },
    { id: "content", word: "content", at: { x: 148, y: TIERS[1] }, tier: 2, parent: "marketing" },
    { id: "next", word: "next.js", at: { x: 252, y: TIERS[1] }, tier: 2, parent: "software" },
    { id: "backend", word: "backend", at: { x: 344, y: TIERS[1] }, tier: 2, parent: "software" },
    { id: "growth", word: "growth", at: { x: 104, y: TIERS[2] }, tier: 3, parent: "content" },
    { id: "ux", word: "ux", at: { x: 200, y: TIERS[2] }, tier: 3, parent: "product" },
    { id: "automation", word: "automation", at: { x: 298, y: TIERS[2] }, tier: 3, parent: "backend" },
];

const SEED: Pt = { x: 200, y: 28 };
const W = 400;
const H = 460;

/* A label's baseline sits this far under its node, and a root leaves
   from this far under it — clear of the word's descenders. */
const LABEL_DROP = 22;
const ROOT_DROP = 32;

/* Seconds a root takes per tier it crosses; the next tier starts as it
   lands. */
const GROW = 0.9;

function mulberry32(seed: number) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const f = (n: number) => n.toFixed(1);

type Root = { d: string; delay: number; width: number; duration: number };
type Label = { word: string; at: Pt; delay: number };

function grow() {
    const rand = mulberry32(20261014);
    const byId = new Map(THOUGHTS.map((t) => [t.id, t]));

    const roots: Root[] = [];
    const labels: Label[] = [];

    for (const t of THOUGHTS) {
        const parent = t.parent ? byId.get(t.parent)! : null;
        const from = parent ? { x: parent.at.x, y: parent.at.y + ROOT_DROP } : SEED;
        const to = t.at;
        const fromTier = parent ? parent.tier : 0;
        const delay = fromTier * GROW;
        const span = (t.tier - fromTier) * GROW;

        /* Roots fall first and drift sideways after: the first control
           sits straight under the start, the second straight over the
           end, each nudged only a little so the curve stays smooth. */
        const dy = to.y - from.y;
        const c1 = { x: from.x + (rand() - 0.5) * 16, y: from.y + dy * 0.5 };
        const c2 = { x: to.x + (rand() - 0.5) * 16, y: to.y - dy * 0.45 };

        roots.push({
            d: `M${f(from.x)} ${f(from.y)} C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(to.x)} ${f(to.y)}`,
            delay,
            width: Math.max(1, 2.2 - t.tier * 0.4),
            duration: span,
        });

        labels.push({ word: t.word, at: to, delay: delay + span * 0.9 });
    }

    return { roots, labels };
}

const TREE = grow();

export default function ContactArt() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.35 });
    const reduce = useReducedMotion();
    const shown = inView || !!reduce;

    const draw = (r: Root) => ({
        initial: reduce ? false : { pathLength: 0, opacity: 0 },
        animate: shown ? { pathLength: 1, opacity: 1 } : undefined,
        transition: {
            pathLength: { duration: r.duration, delay: r.delay, ease: [0.33, 0, 0.2, 1] as const },
            opacity: { duration: 0.01, delay: r.delay },
        },
    });

    return (
        <div ref={ref} aria-hidden className="contact-art h-full min-h-[30rem] lg:min-h-[36rem]">
            <svg
                className="contact-art__svg"
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                strokeLinecap="round"
            >

                <g className="contact-art__roots">
                    {TREE.roots.map((r, i) => (
                        <m.path key={i} d={r.d} strokeWidth={r.width} {...draw(r)} />
                    ))}
                </g>

                <circle className="contact-art__seed" cx={SEED.x} cy={SEED.y} r={5} />

                {TREE.labels.map((l) => (
                    <m.g
                        key={l.word}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={shown ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.6, delay: l.delay, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <circle className="contact-art__node" cx={l.at.x} cy={l.at.y} r={3.5} />
                        <text
                            className="contact-art__word"
                            x={l.at.x}
                            y={l.at.y + LABEL_DROP}
                            textAnchor="middle"
                        >
                            {l.word}
                        </text>
                    </m.g>
                ))}
            </svg>
            <div className="contact-art__grain" />
        </div>
    );
}
