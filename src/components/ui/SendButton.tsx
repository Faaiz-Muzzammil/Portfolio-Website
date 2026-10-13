"use client";

import { AnimatePresence, m, useAnimate, useReducedMotion, type Variants } from "framer-motion";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, type ReactNode } from "react";

import { buttonClasses } from "@/components/ui/Button";
import { PressButton } from "@/components/motion/Press";
import { DURATION, EASE, SHAKE, labelSwap } from "@/lib/motion";

export type SendState = "idle" | "sending" | "sent";

type SendButtonProps = {
    state: SendState;
    /** Bump on every refused attempt (invalid fields, failed send) to
        shake the button once. */
    refusals?: number;
    className?: string;
};

/* ---- THE SEND ----------------------------------------------------
 *
 * A `Button` in every respect a reader can see at rest — same sweep,
 * same press, same size — with three states it moves through in place:
 *
 *   idle      "Send message", a paper plane.
 *   sending   the plane leaves through the button's top-right corner,
 *             the label rolls up to a spinner and "Sending", and the
 *             hover's inversion locks on (`data-swept`): the button has
 *             been taken, it is not a hover.
 *   sent      a tick draws itself, "Sent". When the form goes back to
 *             idle a fresh plane slides in from the other corner.
 *
 * A refused attempt shakes the whole control once. The shake runs on a
 * plain wrapper, not on the `m.button`, so it never fights the press
 * spring for the same transform.
 *
 * THE WIDTH NEVER MOVES. Every label is rendered invisibly in the same
 * grid cell, so the button is always as wide as its widest state and
 * the visible one swaps without the button resizing around it.
 * ------------------------------------------------------------------ */

const plane: Variants = {
    initial: { x: -14, y: 14, opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1, transition: { duration: DURATION.sweep, ease: EASE } },
    exit: { x: 40, y: -40, opacity: 0, transition: { duration: 0.45, ease: [0.55, 0, 0.75, 0.2] } },
};

const still: Variants = { initial: {}, animate: {}, exit: {} };

const LABELS: Record<SendState, ReactNode> = {
    /* The idle row's own wrapper does not move (see `still`): the
       words roll on `labelSwap` and the plane flies on `plane`, each to
       its own clock, and the row leaves once both have gone. */
    idle: (
        <>
            <m.span variants={labelSwap}>Send message</m.span>
            <m.span variants={plane}>
                <span className="sweep-nudge block [--nudge-x:2px] [--nudge-y:-2px]">
                    <PaperPlaneTilt size={16} weight="bold" aria-hidden />
                </span>
            </m.span>
        </>
    ),
    sending: (
        <>
            <m.span
                aria-hidden
                className="size-4 rounded-full border-2 border-current border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
            Sending
        </>
    ),
    sent: (
        <>
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                <m.path
                    d="M2.5 8.5 6.5 12.5 13.5 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="square"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
                />
            </svg>
            Sent
        </>
    ),
};

const ROW = "col-start-1 row-start-1 flex items-center justify-center gap-2.5";

export default function SendButton({ state, refusals = 0, className }: SendButtonProps) {
    const [scope, animate] = useAnimate<HTMLDivElement>();
    const reduce = useReducedMotion();

    useEffect(() => {
        if (!refusals || reduce || !scope.current) return;
        animate(scope.current, { x: [...SHAKE.x] }, SHAKE.transition);
    }, [refusals, reduce, animate, scope]);

    const busy = state === "sending";

    return (
        <div ref={scope} className={className}>
            <PressButton
                type="submit"
                disabled={busy}
                aria-busy={busy}
                data-swept={state === "idle" ? undefined : ""}
                className={buttonClasses("accent", "lg", "w-full sm:w-auto")}
            >
                <span className="grid">
                    {(Object.keys(LABELS) as SendState[]).map((key) => (
                        <span key={key} aria-hidden className={`${ROW} invisible`}>
                            {key === "idle" ? (
                                <>
                                    Send message
                                    <PaperPlaneTilt size={16} weight="bold" />
                                </>
                            ) : key === "sending" ? (
                                <>
                                    <span className="size-4" />
                                    Sending
                                </>
                            ) : (
                                <>
                                    <span className="size-4" />
                                    Sent
                                </>
                            )}
                        </span>
                    ))}

                    <AnimatePresence initial={false}>
                        <m.span
                            key={state}
                            variants={state === "idle" ? still : labelSwap}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={ROW}
                        >
                            {LABELS[state]}
                        </m.span>
                    </AnimatePresence>
                </span>
            </PressButton>
        </div>
    );
}
