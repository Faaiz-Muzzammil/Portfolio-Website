/**
 * Scrolling helpers.
 *
 * These used to route through a module-level Lenis handle so the nav and the
 * voice assistant could drive the smooth-scroll instance from outside its
 * provider's subtree. Lenis is gone and the document scrolls natively, so
 * there is nothing left to hold — just the offset maths, which still has to
 * live somewhere both callers can reach.
 */

export function prefersReducedMotion() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scrolls to a section, clearing the fixed chrome.
 *
 * A nav click is a deliberate jump between two named places, so it still
 * animates — that is the browser's own smooth scroll, not page-wide
 * smoothing, and it is skipped outright under reduced motion.
 */
export function scrollToSection(id: string) {
    if (typeof window === "undefined") return;

    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - remToPx(3.5);

    window.scrollTo({
        top,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
    });

    window.history.replaceState(null, "", id === "home" ? "/" : `#${id}`);
}

export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
}

function remToPx(rem: number) {
    if (typeof window === "undefined") return rem * 16;
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return rem * (Number.isFinite(root) ? root : 16);
}
