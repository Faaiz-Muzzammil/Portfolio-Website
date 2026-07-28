export { scrollToSection, scrollToTop } from "./scroll";

/**
 * Single source of truth for the page's sections, in document order.
 *
 * Consumed by `useActiveSection`. The display names that used to live beside
 * this as SECTION_LABELS went with the route rail — the nav bar reads its own
 * labels from `navItems`, which is the list that decides what appears there.
 */
export const SECTION_IDS = [
    "home",
    "work",
    "experience",
    "toolkit",
    "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Which ink each department paints the margins and the page ground with.
 *
 * THIS IS THE ONLY HUE ON THE SITE, and it is deliberately quarantined out
 * here in the margins. The stylesheet's opening note is not wrong and has not
 * been repealed: the measure is still black, white and the greys between
 * them, emphasis is still weight and inversion, and nothing a reader is meant
 * to *read* has acquired a colour. What has changed is that the two columns
 * either side of the measure now carry one, and it moves as the page does.
 *
 * A RECORD, NOT AN ARRAY, keyed by the ids above. A parallel array in
 * document order would work exactly until someone reorders one list and not
 * the other, at which point the failure is a wrong colour on a section rather
 * than an error anyone can see.
 *
 * THE VALUES ARE NOT HERE. Each entry names a custom property, and the two
 * themes fill it in with different colours — not the same colour at two
 * strengths. A tint does opposite things on the two grounds: on white it
 * removes light and a saturated ink comes out looking like sugar, on black it
 * adds light and anything under about 55% saturation collapses into grey. The
 * dark set is therefore both brighter and more saturated than the light one,
 * which looks wrong written down and is the only way either reads as a colour
 * on its own ground. The reasoning and the values are in `globals.css`.
 *
 * Naming the property rather than the colour is also what keeps this correct
 * across a theme switch with no work: the layers set `color: var(--tint-work)`
 * once when the pair changes, and the cascade re-resolves it the moment
 * `data-theme` flips. Nothing here has to know which theme is on, no component
 * needs a `mounted` guard, and there is no frame where the margins are still
 * painted in the other theme's ink.
 *
 * THE COVER IS NOT A COLOUR, and it is `null` rather than a dark neutral. The
 * colour is drawn as a stack of layers that fade in over one another, so a
 * section with no entry simply contributes no layer — which means the opening
 * screen is not "tinted with something almost black", it is untouched. Every
 * layer above it fades in from nothing as the reader leaves the cover, so the
 * colour arrives as a consequence of reading rather than as a decoration that
 * was already there.
 *
 * The rest is a temperature that walks: ochre for the work, resting on green
 * in the middle of the page, then up through violet to the oxblood at the
 * contact form.
 */
export const SECTION_TINTS: Record<SectionId, string | null> = {
    home: null,
    work: "var(--tint-work)",
    experience: "var(--tint-experience)",
    toolkit: "var(--tint-toolkit)",
    contact: "var(--tint-contact)",
};
