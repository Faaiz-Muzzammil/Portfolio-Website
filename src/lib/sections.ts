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

/*
 * WHICH DEPARTMENT GETS WHICH INK IS NOT DECIDED HERE ANY MORE.
 *
 * A `SECTION_TINTS` record used to sit at this point, mapping each id to a
 * custom property that the margins and the page ground then read. It is gone,
 * and the mapping lives entirely in `globals.css` as one rule per department
 * keyed off `[data-tint]`.
 *
 * The reason is that it had become the second of two lists. `TintController`
 * puts the active section id on the root and the stylesheet turns that into a
 * colour, so a record here could only ever restate what the CSS already says
 * — and two lists that must agree are one list plus a bug waiting to happen.
 * Adding a department now means adding a rule beside the inks it uses, which
 * is where anyone looking for it would go first.
 */
