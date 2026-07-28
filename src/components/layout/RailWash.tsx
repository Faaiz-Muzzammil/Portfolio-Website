import { SECTION_IDS } from "@/lib/sections";

/**
 * One margin's worth of colour.
 *
 * ONE LAYER PER DEPARTMENT, ALL OF THEM PAINTED, ALL BUT ONE AT ZERO
 * OPACITY. The stylesheet raises whichever layer matches the department on
 * the root and lets the rest fall away, so changing section is a pair of
 * opacity transitions — the only kind of change a browser can make without
 * repainting anything or touching the main thread.
 *
 * WHY NOT ONE ELEMENT THAT CHANGES COLOUR. Because that is what it was, and
 * it stalled the page at every boundary. The layer's shape is a gradient
 * built on `currentColor`, so transitioning `color` made the browser
 * regenerate that gradient on all forty-two frames of the transition — a
 * transition is only free if the property being transitioned is free, and
 * `color` drags everything downstream of it along. Here the colour of each
 * layer is fixed for the life of the page and nothing but opacity moves.
 * `globals.css` carries the full list of what was tried before this.
 *
 * IT RENDERS A LAYER FOR EVERY SECTION, including the ones with no ink.
 * Which departments have a colour is a fact about the stylesheet, not about
 * this component — a layer with no rule resolves `color` to `transparent`,
 * paints nothing, and costs nothing. That is also what gives the cover its
 * neutral margins without a special case.
 *
 * There is no state, no hook and no motion value in it. The rails are static
 * markup and the cascade does the rest.
 */
export default function RailWash() {
    return (
        <div className="rail-ground" aria-hidden>
            {SECTION_IDS.map((id) => (
                <div key={id} className="rail-tint" data-for={id} />
            ))}
        </div>
    );
}
