type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
    startViewTransition?: (update: () => void) => {
        finished: Promise<void>;
    };
};

/**
 * Swaps the theme behind a View Transition where the browser has one, so the
 * page cross-fades between paper and ink instead of hard-cutting.
 *
 * TWO GUARDS, AND BOTH FALL BACK TO THE SAME PLAIN ASSIGNMENT.
 *
 *   NO API         Firefox has no `startViewTransition`. Feature-detected
 *                  rather than sniffed, so it starts working there the day
 *                  it ships without a change here.
 *
 *   REDUCED MOTION This was missing, and it is the one that matters. A
 *                  theme toggle is the highest-contrast animation on the
 *                  site — the entire viewport cross-fades between black and
 *                  white — which is exactly the kind of full-screen
 *                  luminance change that `prefers-reduced-motion` exists to
 *                  suppress, and the one most likely to actually hurt
 *                  someone. Every other animation on the site checks the
 *                  query; this one went around it, because it is driven by
 *                  the browser rather than by GSAP or framer-motion, so it
 *                  never passed through the places that check.
 *
 * The setting is read at call time, not at module load, so flipping it in
 * the OS takes effect on the next toggle rather than on the next reload.
 */
export function transitionTheme(setTheme: (theme: Theme) => void, theme: Theme) {
    const documentWithTransition = document as ViewTransitionDocument;

    const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !documentWithTransition.startViewTransition) {
        setTheme(theme);
        return;
    }

    documentWithTransition.startViewTransition(() => setTheme(theme));
}
