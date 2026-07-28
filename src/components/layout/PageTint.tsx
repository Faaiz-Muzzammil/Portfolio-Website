"use client";

import TintStack from "@/components/layout/TintStack";

/**
 * The department's colour on the ground behind the measure.
 *
 * The sections themselves are not surfaces — `Section` renders no panel, no
 * card and no background, deliberately, because a magazine is ink on paper
 * and not a stack of plates. So there is nothing to give a background colour
 * *to*. The colour goes where the paper is instead: one fixed layer over the
 * full viewport, under everything that scrolls, carrying the same ink the two
 * margins are carrying at that moment. Scroll from the work to the experience
 * and the whole page warms through with the rails rather than beside them.
 *
 * IT IS FAR WEAKER THAN THE RAILS, and that is the entire discipline of it.
 * The margins can take two-thirds of an ink because nothing is read out
 * there. This is behind body copy, and every point of tint it takes is a
 * point of contrast taken off the text — so it runs at about a fifth of what
 * the rails run at, which is enough to be seen as a change and not enough to
 * be seen as a colour.
 *
 * NOTHING HERE MOVES. It had a slow drift, which was eight pixels of travel
 * across the entire document on a layer with no edge in it — invisible by
 * construction, and a full-viewport re-raster every frame to produce. The
 * only thing this element does now is cross-fade, and cross-fading is free.
 *
 * NOTHING HERE IS ABOVE THE GRAIN either. It sits at `z-index: 0`, which puts
 * it over the haze and under both the grain and the content, so the page's
 * own texture still reads across the top of the colour exactly as it does
 * across the top of the paper.
 */
export default function PageTint() {
    return (
        <div className="page-tint" aria-hidden>
            <TintStack className="page-tint-layer" />
        </div>
    );
}
