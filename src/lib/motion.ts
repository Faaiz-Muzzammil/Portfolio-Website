import type { Transition } from "framer-motion";

/**
 * Shared motion vocabulary.
 *
 * Two systems, cleanly divided:
 *   GSAP + ScrollTrigger  — scroll-driven reveals and text splitting
 *   framer-motion (`m.*`) — interactive component state (nav, rail, forms)
 *
 * `MotionProvider` runs LazyMotion in strict mode with the `domAnimation`
 * bundle: `m.*` only, and no `layout` / `layoutId` / `drag` (those need
 * `domMax`).
 *
 * Only what is in use lives here. A shared vocabulary nothing speaks is just
 * a list of guesses about what some future component might want.
 */

/** Expo-out — the one curve the whole site shares. */
export const EASE_OUT = "expo.out";

/** The nav's active marker. */
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 36 };
