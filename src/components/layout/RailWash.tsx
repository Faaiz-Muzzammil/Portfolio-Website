"use client";

import TintStack from "@/components/layout/TintStack";

/**
 * One margin's worth of colour.
 *
 *   TINT    The department's ink, as two cross-fading layers. Their shape —
 *           strongest out at the screen edge, falling away toward the rule,
 *           with a soft core high on the outer side — is baked into each
 *           layer's own gradient in `globals.css`. Opacity is the only thing
 *           that moves, and it moves on the compositor.
 *   GRAIN   The page's own grey noise over the top, fixed and unchanged from
 *           what it has always been.
 *
 * NOTHING IN THE RAIL TRANSFORMS ANY MORE. This carried three drifting layers
 * at three rates — a wash, a bloom over it, and a ruled scale travelling
 * against the scroll — on the theory that three rates is parallax and one is
 * not. Two of the three were invisible by construction: a soft mass has no
 * edge for the eye to track, so a gradient sliding under another gradient
 * reads as nothing at all while costing a full-height re-raster every frame.
 *
 * The scale was the one you could see, and it went last and most reluctantly.
 * It was a tall tiled background under a mask, translated on every frame, in
 * a fixed column beside body copy — and a moving ruler in the corner of the
 * eye is a real cost to pay in scroll smoothness for something nobody is
 * looking at. The colour changing as the page moves is the effect that was
 * asked for; it does not need a second thing moving to prove it is moving.
 *
 * What survived is the bloom's *shape*, which is now a gradient rather than a
 * layer, and costs one paint at mount.
 *
 * THE COLOUR IS UNDER THE GRAIN, not in it. Both rails carry the same grey
 * noise as the rest of the page; what varies is the ink beneath it. That is
 * the difference between a margin that reads as tinted paper and one that
 * reads as a screen with a fault.
 *
 * THE COLOUR ITSELF comes from `TintProvider` by way of `TintStack`, so the
 * two rails and the ground behind the measure are provably the same value and
 * cannot drift apart from one another.
 *
 * IT TAKES NO SIDE. Which way the gradients run is decided by `.rail-left` and
 * `.rail-right` on the container, in the stylesheet, because that is a fact
 * about how the layer is painted and there is no longer anything here that
 * needs to know it.
 */
export default function RailWash() {
    return (
        <div className="rail-ground" aria-hidden>
            <div className="rail-tint">
                <TintStack className="rail-tint-layer" />
            </div>
        </div>
    );
}
