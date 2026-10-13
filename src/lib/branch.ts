/* ---- GROWING BRANCHES --------------------------------------------
 *
 * The geometry behind the cover's branch, growing out of the portrait
 * into the panel beside it. One stem enters from the left edge, opens into a fan of main limbs, and
 * each limb forks in two at every level, the split narrowing as it goes
 * so the twigs of one limb stay clear of its neighbours'.
 *
 * Every limb carries the delay at which it starts growing — a fork
 * starts as its parent lands — so a renderer only has to animate each
 * path's length from its own delay.
 *
 * Deterministic: a fixed seed, so server and client generate the same
 * tree and every visit sees the same one. Every coordinate is rounded
 * to one decimal, because the server and the browser can disagree in
 * the last bits of a float and an unrounded attribute is a hydration
 * mismatch.
 * ------------------------------------------------------------------ */

export type Pt = { x: number; y: number };
export type Limb = { d: string; delay: number; width: number };
export type Bud = { at: Pt; delay: number };
export type Tree = {
    w: number;
    h: number;
    limbs: Limb[];
    /* The tips. */
    buds: Bud[];
};

/* Seconds a limb takes to grow. */
export const GROW = 0.45;

/* The stem out of the left edge, before the fan opens. */
const STEM = 20;

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

const r1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Grows a tree in a `w` × `h` box.
 *
 * `fan` is the main limbs' angles in radians from the horizontal,
 * negative up. Each limb is sized so its tips land on an ellipse
 * inscribed in the box — which is what fills a 4:5 panel and a tall
 * column alike, instead of a tuft in the middle or tips flattened
 * against an edge. `depth` is the fork levels under each main limb, so
 * each ends in 2^depth tips. `start` is when the stem begins, in seconds.
 */
export function grow(
    w: number,
    h: number,
    fan: number[],
    { depth = 4, start = 0.5, seed = 20261014 }: { depth?: number; start?: number; seed?: number } = {},
): Tree {
    const rand = mulberry32(seed);
    const limbs: Limb[] = [];
    const buds: Bud[] = [];

    const rx = w - STEM - 10;
    const ry = h / 2 - 10;
    /* How far a limb and all its forks reach, as a multiple of the
       limb's own length: 1 + 0.75 + 0.75² + … over the levels. */
    const reachOf = (1 - Math.pow(0.75, depth + 1)) / (1 - 0.75);

    const limb = (from: Pt, angle: number, length: number, level: number, delay: number) => {
        const to = {
            x: r1(clamp(from.x + Math.cos(angle) * length, 0, w - 5)),
            y: r1(clamp(from.y + Math.sin(angle) * length, 6, h - 6)),
        };

        /* A slight bow, so no limb is a ruled line. */
        const bow = (rand() - 0.5) * length * 0.3;
        const c = {
            x: r1((from.x + to.x) / 2 - Math.sin(angle) * bow),
            y: r1((from.y + to.y) / 2 + Math.cos(angle) * bow),
        };

        limbs.push({
            d: `M${from.x} ${from.y} Q${c.x} ${c.y} ${to.x} ${to.y}`,
            delay,
            width: Math.max(0.45, 1.6 - level * 0.25),
        });

        return to;
    };

    const fork = (from: Pt, angle: number, length: number, level: number, delay: number) => {
        const to = limb(from, angle, length, level, delay);
        const next = delay + GROW;

        if (level === depth + 1) {
            buds.push({ at: to, delay: next });
            return;
        }

        const spread = 0.34 * Math.pow(0.82, level - 1);
        for (const side of [-1, 1]) {
            const turn = side * spread * (0.75 + rand() * 0.5);
            fork(to, angle + turn, length * (0.7 + rand() * 0.1), level + 1, next + rand() * 0.08);
        }
    };

    const root = limb({ x: 0, y: h / 2 }, 0, STEM, 0, start);

    for (const a of fan) {
        const reach = 1 / Math.hypot(Math.cos(a) / rx, Math.sin(a) / ry);
        const angle = a + (rand() - 0.5) * 0.12;
        fork(root, angle, (0.92 * reach) / reachOf, 1, start + GROW);
    }

    return { w, h, limbs, buds };
}
