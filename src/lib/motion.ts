import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion vocabulary.
 *
 * Two systems, cleanly divided:
 *   GSAP + ScrollTrigger  — scroll-driven reveals and text splitting
 *   framer-motion (`m.*`) — interactive component state (nav, rail, forms,
 *                           every press)
 *
 * `MotionProvider` runs LazyMotion in strict mode with the `domAnimation`
 * bundle: `m.*` only, and no `layout` / `layoutId` / `drag` (those need
 * `domMax`). It also sets `reducedMotion="user"`, so every transform here
 * is dropped for a reader who asked for less motion — call sites do not
 * need their own `motion-reduce:` escape hatches.
 *
 * ── ONE FEEL FOR EVERY CONTROL ───────────────────────────────────────
 *
 * The same four things happen to every control on the site, and each has
 * exactly one figure:
 *
 *   press    `press` — a spring down to 0.97 and back. Every button,
 *            link-button and icon control, via `PressButton` / `PressLink`.
 *   hover    a filled control sweeps its fill up from the bottom edge
 *            (`.sweep` in globals.css, `DURATION.sweep` on `EASE`);
 *            a bare icon only changes ink (`DURATION.base`).
 *   swap     a label that changes in place rolls up (`labelSwap`).
 *   notice   a status line under a form rises in and fades out (`notice`).
 *
 * The CSS side reads the same numbers from `--motion-*` in globals.css.
 * Change one, change both.
 */

/** Expo-out — the one curve the whole site shares. GSAP's name for it. */
export const EASE_OUT = "expo.out";

/** The same curve as a bezier, for framer-motion and CSS. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Seconds. `quick` for exits and ticks, `base` for state, `sweep` for fills. */
export const DURATION = { quick: 0.2, base: 0.3, sweep: 0.5 } as const;

/** The nav's active marker. */
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 36 };

/** A press: quick to go down, a touch of give on the way back up. */
export const springPress: Transition = { type: "spring", stiffness: 600, damping: 28, mass: 0.6 };

/** Spread onto any `m.*` control. */
export const press = {
    whileTap: { scale: 0.97 },
    transition: springPress,
} as const;

/** A status line: rises into place, leaves quicker than it came. */
export const notice: Variants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
    exit: { opacity: 0, y: -4, transition: { duration: DURATION.quick, ease: EASE } },
};

/** A label replaced in place: the old one rolls out the top, the new one
    in from the bottom, clipped by its own line. */
export const labelSwap: Variants = {
    initial: { y: "110%", opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
    exit: { y: "-110%", opacity: 0, transition: { duration: DURATION.quick, ease: EASE } },
};

/** A refused submission: a short, damped head-shake. */
export const SHAKE = {
    x: [0, -6, 5, -3, 2, 0],
    transition: { duration: 0.4, ease: "easeOut" },
} as const;
