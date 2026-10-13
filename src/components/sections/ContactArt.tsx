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
 * The geometry is generated once, at module load, from a fixed seed, so
 * server and client draw the same roots and every visit sees the same
 * tree. The panel, the grain and the colours are `.contact-art` in
 * `globals.css`.
 * ------------------------------------------------------------------ */

type Pt = { x: number; y: number };

type Thought = { id: string; word: string; at: Pt; parent?: string };

/* The tree. A thought hangs off the one it grew from, so the order here
   is the order they are reached. Coordinates are in the 400×600 box. */
const THOUGHTS: Thought[] = [
    { id: "family", word: "family", at: { x: 92, y: 165 } },
    { id: "work", word: "hard work", at: { x: 300, y: 180 } },
    { id: "marketing", word: "marketing", at: { x: 205, y: 290 } },
    { id: "curiosity", word: "curiosity", at: { x: 58, y: 315 }, parent: "family" },
    { id: "discipline", word: "discipline", at: { x: 338, y: 330 }, parent: "work" },
    { id: "story", word: "storytelling", at: { x: 128, y: 430 }, parent: "marketing" },
    { id: "people", word: "people", at: { x: 285, y: 445 }, parent: "marketing" },
    { id: "patience", word: "patience", at: { x: 62, y: 545 }, parent: "curiosity" },
    { id: "growth", word: "growth", at: { x: 205, y: 552 }, parent: "story" },
    { id: "craft", word: "craft", at: { x: 340, y: 548 }, parent: "discipline" },
];

const SEED: Pt = { x: 200, y: 28 };

/* Timings, in seconds. A root takes GROW to reach its word, and the
   next tier starts as it lands. */
const GROW = 1.1;
const HAIR = 0.7;

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

function bezierAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return {
        x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
        y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    };
}

const f = (n: number) => n.toFixed(1);

type Root = { d: string; delay: number; width: number };
type Label = { word: string; at: Pt; delay: number; anchor: "start" | "middle" | "end" };

function grow() {
    const rand = mulberry32(20261014);
    const byId = new Map(THOUGHTS.map((t) => [t.id, t]));
    const depth = (t: Thought): number => (t.parent ? depth(byId.get(t.parent)!) + 1 : 0);

    const roots: Root[] = [];
    const hairs: Root[] = [];
    const labels: Label[] = [];

    for (const t of THOUGHTS) {
        const level = depth(t);
        const from = t.parent ? byId.get(t.parent)!.at : SEED;
        const to = t.at;
        const delay = level * GROW;

        /* Roots fall first and wander sideways after, so the controls
           sit below the start and above the end, nudged off the line. */
        const dy = to.y - from.y;
        const c1 = { x: from.x + (rand() - 0.5) * 50, y: from.y + dy * (0.35 + rand() * 0.2) };
        const c2 = { x: to.x + (rand() - 0.5) * 60, y: to.y - dy * (0.3 + rand() * 0.2) };

        roots.push({
            d: `M${f(from.x)} ${f(from.y)} C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(to.x)} ${f(to.y)}`,
            delay,
            width: 2.4 - level * 0.5,
        });

        /* Rootlets: short hairs off the main root, each starting as the
           root passes the point it grows from. */
        const count = 2 + Math.floor(rand() * 3);
        for (let i = 0; i < count; i++) {
            const at = 0.2 + rand() * 0.65;
            const p = bezierAt(from, c1, c2, to, at);
            const side = rand() < 0.5 ? -1 : 1;
            const len = 18 + rand() * 30;
            const end = { x: p.x + side * len, y: p.y + len * (0.5 + rand() * 0.6) };
            const mid = { x: p.x + side * len * 0.6, y: p.y + len * 0.1 };
            hairs.push({
                d: `M${f(p.x)} ${f(p.y)} Q${f(mid.x)} ${f(mid.y)} ${f(end.x)} ${f(end.y)}`,
                delay: delay + at * GROW,
                width: 0.9,
            });
        }

        labels.push({
            word: t.word,
            at: to,
            delay: delay + GROW * 0.85,
            anchor: to.x < 110 ? "start" : to.x > 290 ? "end" : "middle",
        });
    }

    return { roots, hairs, labels };
}

const TREE = grow();

export default function ContactArt() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.35 });
    const reduce = useReducedMotion();
    const shown = inView || !!reduce;

    const draw = (r: Root, duration: number) => ({
        initial: reduce ? false : { pathLength: 0, opacity: 0 },
        animate: shown ? { pathLength: 1, opacity: 1 } : undefined,
        transition: {
            pathLength: { duration, delay: r.delay, ease: [0.33, 0, 0.2, 1] as const },
            opacity: { duration: 0.01, delay: r.delay },
        },
    });

    return (
        <div ref={ref} aria-hidden className="contact-art h-full min-h-[30rem] lg:min-h-[36rem]">
            <svg
                className="contact-art__svg"
                viewBox="0 0 400 600"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                strokeLinecap="round"
            >
                <g className="contact-art__hairs">
                    {TREE.hairs.map((h, i) => (
                        <m.path key={i} d={h.d} strokeWidth={h.width} {...draw(h, HAIR)} />
                    ))}
                </g>

                <g className="contact-art__roots">
                    {TREE.roots.map((r, i) => (
                        <m.path key={i} d={r.d} strokeWidth={r.width} {...draw(r, GROW)} />
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
                            y={l.at.y + 22}
                            textAnchor={l.anchor}
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
