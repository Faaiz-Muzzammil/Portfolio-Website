"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, CheckCircle, PaperPlaneTilt, Warning } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { personalInfo } from "@/data";
import { cn } from "@/lib/cn";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import RunningHead from "@/components/ui/RunningHead";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";

type Status =
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "error"; message: string; mailto?: string };

/* ---- THREE FIELDS ON ONE COLUMN -----------------------------------
 *
 * The department is a form and a way around the form, and that is all
 * it is now. What was here before was a sidebar and a form side by
 * side: a portrait, a name, a role, a place, an email, a voice note,
 * an opening hours block and a four-option topic picker, in two
 * columns of nearly equal weight with a dead column between them. Two
 * columns of equal weight have no reading order, so the eye had to
 * pick, and half of what it found had been said elsewhere on the page
 * already.
 *
 * WHAT WENT, AND WHY EACH ONE WENT:
 *
 *   THE PORTRAIT      The cover has the face. A second copy above a
 *                     form is decoration on the one screen where the
 *                     reader has something to do.
 *   NAME AND ROLE     In the masthead and in the colophon. Three times
 *                     on one page is not emphasis.
 *   THE TOPIC FIELD   A required select whose every answer is the
 *                     first line of the message anyway. See the note
 *                     in `validation/contact.ts`.
 *   VOICE AND HOURS   True, and nobody came here to read them. The mic
 *                     is in the top bar where it can be used; the
 *                     reply time is already in the running head.
 *   THE STANDFIRST    "Freelance or full-time, or just a question" —
 *                     a paragraph restating the heading directly above
 *                     it.
 *
 * WHAT IS LEFT IS ONE COLUMN, FULL MEASURE, WITH TWO EDGES. Name and
 * email split it in half, the message spans it, and the foot carries
 * the direct address and the send on the same rule. Every element in
 * the department starts on one of two vertical lines and ends on one
 * of two — which is the whole of what makes it look composed rather
 * than assembled, and it is worth more here than any device would be.
 * ------------------------------------------------------------------ */

/* The resting rule is the heavier hairline, because it is a rule you
   write on rather than a division; focus takes it to full ink, which is
   how a monochrome page says "active".

   ── WHY THE GLOBAL FOCUS RING IS TURNED OFF HERE ────────────────────

   `globals.css` gives everything a `:focus-visible` outline — 2px of
   `--accent`, offset 3px — and on a normal control that is exactly
   right. On these it drew a full rectangle around a field that has no
   rectangle: the box is three invisible sides and one rule you write
   on, so focusing it summoned a border that does not exist at rest and
   vanishes again on blur. It also boxed in the browser's own autofill
   dropdown, which is what made it obvious.

   REPLACING IT, NOT REMOVING IT. `outline-none` on its own is an
   accessibility regression — a keyboard user needs to see where they
   are. The replacement is the field's own rule going to full ink *and*
   doubling in weight, which is a larger visual change than the ring
   was and is drawn in the vocabulary the field is already using.

   THE SECOND PIXEL IS AN INSET SHADOW, NOT A BORDER. Taking
   `border-b` from 1px to 2px on focus reflows the field by a pixel and
   nudges everything under it; an inset shadow sitting on the bottom
   edge paints the same line and occupies no space. */
const FIELD =
    "w-full border-x-0 border-t-0 border-b bg-transparent px-0 py-3 text-body text-ink " +
    "transition-[color,border-color,box-shadow] duration-300 placeholder:text-ink-4 " +
    "focus:outline-none focus:border-ink focus:shadow-[inset_0_-1px_0_0_var(--ink)]";

/* The caption goes to full ink while its own field has focus, so the
   live field is marked at both ends — the rule under it thickens and
   the label above it comes up. It is `group-focus-within` rather than
   `peer-focus`, because the label precedes the input in the DOM and a
   peer selector can only look forward. */
const LABEL =
    "coord mb-1 block text-coord text-ink-3 transition-colors duration-300 group-focus-within:text-ink";

export default function Contact() {
    const [status, setStatus] = useState<Status>({ kind: "idle" });
    const uid = useId();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<ContactInput>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", message: "", honeypot: "" },
    });

    const onSubmit = async (data: ContactInput) => {
        setStatus({ kind: "sending" });

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (json.fields) {
                    for (const [field, messages] of Object.entries(json.fields)) {
                        const first = Array.isArray(messages) ? messages[0] : messages;
                        if (first) {
                            setError(field as keyof ContactInput, { message: String(first) });
                        }
                    }
                }
                setStatus({
                    kind: "error",
                    message: json.error ?? "That didn't send.",
                    mailto: json.mailto,
                });
                return;
            }

            reset();
            setStatus({ kind: "sent" });
        } catch {
            setStatus({
                kind: "error",
                message: "Network problem — check your connection and try again.",
                mailto: personalInfo.email,
            });
        }
    };

    const isSending = status.kind === "sending";

    const fieldError = (name: keyof ContactInput) => (
        <AnimatePresence mode="wait">
            {errors[name]?.message && (
                <m.p
                    key={String(errors[name]?.message)}
                    id={`${uid}-${name}-error`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 flex items-center gap-1.5 text-caption text-danger"
                >
                    <Warning size={13} weight="fill" aria-hidden />
                    {errors[name]?.message}
                </m.p>
            )}
        </AnimatePresence>
    );

    const a11y = (name: keyof ContactInput) => ({
        "aria-invalid": errors[name] ? true : undefined,
        "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
    });

    return (
        <div>
            <RunningHead
                id="contact-title"
                dept="contact"
                number="03"
                name="Contact"
                meta="Replies within a day"
                title="Tell me what you're"
                accentTitle="building."
            />

            <Reveal>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="relative border-t-2 border-ink pt-8"
                >
                    {/* Honeypot — off-screen, out of the tab order, hidden from AT. */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
                    >
                        <label htmlFor={`${uid}-company`}>Company</label>
                        <input
                            id={`${uid}-company`}
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            {...register("honeypot")}
                        />
                    </div>

                    {/* No column gap below `sm`: a two-track grid with a 2rem
                        gutter cannot be narrower than the gutter plus its
                        columns, and the fields stack down there anyway. */}
                    <div className="grid gap-7 sm:grid-cols-2 sm:gap-x-8">
                        <div className="group">
                            <label htmlFor={`${uid}-name`} className={LABEL}>
                                Name
                            </label>
                            <input
                                id={`${uid}-name`}
                                type="text"
                                autoComplete="name"
                                placeholder="Your name"
                                className={cn(FIELD, errors.name ? "border-danger" : "border-line-2")}
                                {...a11y("name")}
                                {...register("name")}
                            />
                            {fieldError("name")}
                        </div>

                        <div className="group">
                            <label htmlFor={`${uid}-email`} className={LABEL}>
                                Email
                            </label>
                            <input
                                id={`${uid}-email`}
                                type="email"
                                autoComplete="email"
                                placeholder="you@company.com"
                                className={cn(FIELD, errors.email ? "border-danger" : "border-line-2")}
                                {...a11y("email")}
                                {...register("email")}
                            />
                            {fieldError("email")}
                        </div>
                    </div>

                    <div className="group mt-7">
                        <label htmlFor={`${uid}-message`} className={LABEL}>
                            Message
                        </label>
                        <textarea
                            id={`${uid}-message`}
                            rows={5}
                            placeholder="What are you building, and where do I fit in?"
                            className={cn(
                                FIELD,
                                "resize-y",
                                errors.message ? "border-danger" : "border-line-2",
                            )}
                            {...a11y("message")}
                            {...register("message")}
                        />
                        {fieldError("message")}
                    </div>

                    {/* The foot. The direct address sits opposite the send
                        because they are the two ways out of this department,
                        and putting them on one rule says so — a reader who
                        was never going to fill in a form finds the address in
                        the place they were already looking for the button. */}
                    <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 border-t border-line pt-6">
                        <a
                            href={`mailto:${personalInfo.email}`}
                            className="group/mail inline-flex items-baseline gap-1.5 text-body"
                        >
                            <span className="rule-draw break-all text-ink-2 transition-colors duration-300 group-hover/mail:text-ink group-active/mail:text-ink">
                                {personalInfo.email}
                            </span>
                            <ArrowUpRight
                                size={13}
                                weight="bold"
                                aria-hidden
                                className="self-center text-ink-4 transition-[transform,color] duration-300 group-hover/mail:-translate-y-0.5 group-hover/mail:translate-x-0.5 group-hover/mail:text-ink"
                            />
                        </a>

                        <Magnetic strength={0.2} innerStrength={0.08}>
                            <button
                                type="submit"
                                disabled={isSending}
                                className="group/send relative inline-flex h-13 w-full items-center justify-center gap-2.5 overflow-hidden bg-accent px-8 text-[0.9375rem] font-medium text-accent-fg transition-transform duration-300 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
                            >
                                <span className="absolute inset-0 translate-y-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/send:translate-y-0 motion-reduce:hidden" />
                                <span className="relative z-10 flex items-center gap-2.5 transition-colors duration-300 group-hover/send:text-paper">
                                    {isSending ? (
                                        <>
                                            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Sending
                                        </>
                                    ) : (
                                        <>
                                            <PaperPlaneTilt size={16} weight="fill" aria-hidden />
                                            Send message
                                        </>
                                    )}
                                </span>
                            </button>
                        </Magnetic>
                    </div>

                    <div role="status" aria-live="polite" className="mt-6 empty:hidden">
                        <AnimatePresence mode="wait">
                            {status.kind === "sent" && (
                                /* Marked with a rule rather than boxed. A
                                   panel here would be the only filled surface
                                   in the department, appearing at the exact
                                   moment the reader is finished with it. */
                                <m.p
                                    key="sent"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 border-l-2 border-ink py-1 pl-4 text-caption text-ink"
                                >
                                    <CheckCircle size={16} weight="fill" aria-hidden />
                                    Sent. I&apos;ll get back to you within a day.
                                </m.p>
                            )}

                            {status.kind === "error" && (
                                <m.p
                                    key="error"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border-l-2 border-danger py-1 pl-4 text-caption text-danger"
                                >
                                    <Warning size={16} weight="fill" aria-hidden />
                                    {status.message}
                                    {status.mailto && (
                                        <a
                                            href={`mailto:${status.mailto}`}
                                            className="font-medium underline underline-offset-2"
                                        >
                                            Email me at {status.mailto}
                                        </a>
                                    )}
                                </m.p>
                            )}
                        </AnimatePresence>
                    </div>
                </form>
            </Reveal>
        </div>
    );
}
