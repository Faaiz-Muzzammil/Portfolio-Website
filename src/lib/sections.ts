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
