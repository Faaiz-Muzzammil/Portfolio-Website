"use client";

import { m } from "framer-motion";

import { SECTION_IDS, SECTION_TINTS } from "@/lib/sections";
import { useTint } from "@/providers/TintProvider";

/**
 * The colour, as two layers that cross-fade.
 *
 * TWO, NOT ONE PER SECTION. Only two inks can ever be visible at once — the
 * one being left and the one being arrived at — so only two are drawn. The
 * pair changes about four times in a full read of the page; within a pair the
 * only thing that moves is the upper layer's opacity, which the compositor
 * animates on the GPU without touching the main thread.
 *
 * The alternative, and what this was, is to stack all five and cross-fade the
 * pile. It gives an identical picture and costs five composited surfaces in
 * each of three places, most of them viewport-sized, blended on every frame
 * for the life of the page.
 *
 * NOTHING HERE ANIMATES A COLOUR. `color` is a plain string written once when
 * the pair changes; the shape and the strength of each layer are baked into a
 * gradient in the stylesheet that reads it through `currentColor`. There are
 * no masks anywhere in this, for the same reason — a mask forces its element
 * into a render surface that has to be re-applied whenever anything inside it
 * changes, which with an opacity animating inside is every frame.
 *
 * THE COVER HAS NO LOWER LAYER. `home` has no ink in `SECTION_TINTS`, so on
 * the first pair there is nothing underneath and the work's ochre fades up out
 * of the page's own neutral. That is a stronger guarantee than fading a dark
 * neutral in and out — there is no layer to get the opacity of wrong.
 *
 * The swap at a boundary is seamless by construction: crossing from pair *i*
 * to pair *i+1* moves the ink that was fading in at full opacity down into the
 * lower slot and starts the next one at nought, which is the same picture on
 * both sides of the change.
 */
const TINTS = SECTION_IDS.map((id) => SECTION_TINTS[id]);

export default function TintStack({ className }: { className: string }) {
    const { segment, blend } = useTint();

    const under = TINTS[segment];
    const over = TINTS[segment + 1];

    /* Only the upper layer's opacity moves, so only the upper layer is
       promoted — the `-over` modifier carries a `will-change: opacity` in the
       stylesheet. Without it the browser has no way to know that a style
       property being written from script every frame is an animation, and it
       repaints a viewport-sized gradient instead of compositing one. With it
       on both, two full-screen layers are held in GPU memory to animate one. */
    return (
        <>
            {under !== null && (
                <div className={className} style={{ color: under }} />
            )}

            {over !== null && (
                <m.div
                    className={`${className} ${className}-over`}
                    style={{ color: over, opacity: blend }}
                />
            )}
        </>
    );
}
