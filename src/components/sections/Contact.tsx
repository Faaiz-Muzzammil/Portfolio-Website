"use client";

import { AnimatePresence, m } from "framer-motion";
import { Check, CheckCircle, Warning } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { personalInfo } from "@/data";
import { cn } from "@/lib/cn";
import { DURATION, EASE, notice } from "@/lib/motion";
import { CONTACT_LIMITS, contactSchema, type ContactInput } from "@/lib/validation/contact";
import RunningHead from "@/components/ui/RunningHead";
import Magnetic from "@/components/motion/Magnetic";
import SendButton from "@/components/ui/SendButton";
import Reveal from "@/components/motion/Reveal";
import ContactArt from "@/components/sections/ContactArt";

type Status =
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "error"; message: string; mailto?: string }
    | { kind: "invalid"; count: number };

const SENT_NOTICE_MS = 5000;
const SEND_TIMEOUT_MS = 15000;

/* Tab order for Enter-to-advance. The message is last, and Enter there
   is a new line, as it should be. */
const FIELD_ORDER = ["name", "email", "subject", "message"] as const;
type FieldName = (typeof FIELD_ORDER)[number];

/* ---- A FORM ON A READING MEASURE --------------------------------
 *
 * The department is a form and a way around the form, and that is all
 * it is. The portrait, the repeated name and role, the hours block and
 * the topic select all went in an earlier pass, each for saying again
 * what the page had already said.
 *
 * THE MEASURE IS THE REDESIGN. The fields used to run the full width of
 * the page, so the message rule was 1100px long — a line nobody writes
 * across and the eye cannot hold. They sit on a 48rem column now, on the
 * same left edge as the heading. Beside them, on the left at `lg`, is one
 * grained, abstract piece in the department's colour — see `ContactArt`.
 * Below `lg` it follows the form, because the form comes first.
 *
 * ONE KIND OF RULE. The column opened on a 2px black rule and the send
 * sat under a third hairline, so three weights of line were competing
 * with the fields' own. Now the only rules are the ones you write on.
 *
 * THE FOOT CARRIES THE WAY AROUND. The direct address sits on the same
 * line as the send, so someone who would rather use their own mail
 * client sees that option at the moment of deciding.
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

   AND IT HAS TO BE `!important`. The global rule is unlayered CSS and
   Tailwind's utilities live in `@layer utilities`; an unlayered rule
   beats a layered one whatever the specificity, so a plain
   `focus:outline-none` lost and the ring came back on every focus.

   THE SECOND PIXEL IS AN INSET SHADOW, NOT A BORDER. Taking
   `border-b` from 1px to 2px on focus reflows the field by a pixel and
   nudges everything under it; an inset shadow sitting on the bottom
   edge paints the same line and occupies no space. */
const FIELD =
    "w-full border-x-0 border-t-0 border-b bg-transparent px-0 py-3 text-body text-ink " +
    "transition-[color,border-color,box-shadow] duration-300 ease-expo placeholder:text-ink-4 " +
    "focus:outline-none! focus:border-ink focus:shadow-[inset_0_-1px_0_0_var(--ink)]";

/* The caption goes to full ink while its own field has focus, so the
   live field is marked at both ends — the rule under it thickens and
   the label above it comes up. It is `group-focus-within` rather than
   `peer-focus`, because the label precedes the input in the DOM and a
   peer selector can only look forward. */
const LABEL =
    "coord mb-1 block text-coord text-ink-3 transition-colors duration-300 ease-expo group-focus-within:text-ink";

export default function Contact() {
    const [status, setStatus] = useState<Status>({ kind: "idle" });
    /* Counts refused attempts; each bump shakes the send once. */
    const [refusals, setRefusals] = useState(0);
    const uid = useId();
    const formRef = useRef<HTMLFormElement>(null);

    /* CLICKING AWAY ENDS THE FIELD. A desktop browser already blurs an
       input when you click blank page, but iOS Safari does not: a tap on
       text or background leaves the field focused, its rule at full ink
       and the keyboard up, so the form looked stuck "on". This releases
       focus on any press outside a control. A press on another control
       is left alone — that control takes focus itself, and blurring here
       first would close and reopen the phone keyboard. Escape does the
       same from the keyboard. */
    useEffect(() => {
        const activeField = () => {
            const el = document.activeElement;
            return el instanceof HTMLElement && formRef.current?.contains(el) && el.matches("input, textarea")
                ? el
                : null;
        };

        const onPointerDown = (e: PointerEvent) => {
            const field = activeField();
            if (!field) return;
            const target = e.target as Element | null;
            if (target?.closest("input, textarea, select, button, a, label, [contenteditable], [tabindex]:not([tabindex='-1'])")) return;
            field.blur();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") activeField()?.blur();
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    /* The confirmation is a moment, not a fixture: it clears itself
       after a few seconds so the form reads as ready for the next one. */
    useEffect(() => {
        if (status.kind !== "sent") return;
        const timer = window.setTimeout(() => setStatus({ kind: "idle" }), SENT_NOTICE_MS);
        return () => window.clearTimeout(timer);
    }, [status.kind]);

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields, isSubmitting },
        setError,
        setFocus,
        reset,
        control,
    } = useForm<ContactInput>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", subject: "", message: "", honeypot: "" },
        /* Judged when you leave a field, not on every keystroke of the
           first attempt — and, once a field has been flagged, re-judged
           live, so the error clears the moment it is fixed. */
        mode: "onTouched",
        reValidateMode: "onChange",
    });

    const onSubmit = async (data: ContactInput) => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            setStatus({
                kind: "error",
                message: "You're offline. Reconnect and send again — your message is still here.",
            });
            setRefusals((n) => n + 1);
            return;
        }

        setStatus({ kind: "sending" });

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
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
                setRefusals((n) => n + 1);
                return;
            }

            reset();
            setStatus({ kind: "sent" });
        } catch (error) {
            const timedOut = error instanceof DOMException && error.name === "TimeoutError";
            setStatus({
                kind: "error",
                message: timedOut
                    ? "That took too long to send. Try again — your message is still here."
                    : "Network problem — check your connection and try again.",
                mailto: personalInfo.email,
            });
            setRefusals((n) => n + 1);
        }
    };

    /* An invalid send focuses the first flagged field (react-hook-form
       does that) and says how many need fixing, under the button where
       the eye already is. */
    const onInvalid = (invalid: Partial<Record<keyof ContactInput, unknown>>) => {
        const count = FIELD_ORDER.filter((name) => invalid[name]).length;
        setStatus({ kind: "invalid", count });
        setRefusals((n) => n + 1);
    };

    const isSending = status.kind === "sending" || isSubmitting;
    const values = useWatch({ control });
    const messageLength = values.message?.length ?? 0;
    const submit = handleSubmit(onSubmit, onInvalid);

    /* Any edit after a failed send clears the notice: it described the
       form as it was, not as it is. The field errors keep their own
       live state. */
    const clearNotice = () => {
        if (status.kind === "error" || status.kind === "invalid") setStatus({ kind: "idle" });
    };

    /* Enter in a one-line field moves on rather than sending a form
       that is two fields from finished. */
    const advanceOnEnter = (name: FieldName) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
        e.preventDefault();
        const next = FIELD_ORDER[FIELD_ORDER.indexOf(name) + 1];
        if (next) setFocus(next);
    };

    /* A quiet tick once a field has been left and passes. Not on the
       optional subject while it is empty — an empty optional field is
       not an achievement. */
    const isValid = (name: FieldName) =>
        Boolean(touchedFields[name] && !errors[name] && values[name]?.trim());

    const validMark = (name: FieldName) => (
        <AnimatePresence>
            {isValid(name) && (
                <m.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: DURATION.quick, ease: EASE }}
                    aria-hidden
                    className="pointer-events-none absolute right-0 bottom-3.5 text-ink-3"
                >
                    <Check size={14} weight="bold" />
                </m.span>
            )}
        </AnimatePresence>
    );

    const fieldError = (name: keyof ContactInput) => (
        <AnimatePresence mode="wait">
            {errors[name]?.message && (
                <m.p
                    key={String(errors[name]?.message)}
                    id={`${uid}-${name}-error`}
                    variants={notice}
                    initial="initial"
                    animate="animate"
                    exit="exit"
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
        <div className="grid gap-x-12 gap-y-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
                <RunningHead
                    id="contact-title"
                    dept="contact"
                    title="Tell me what you're"
                    accentTitle="building."
                />

                <Reveal>
                    <form ref={formRef} onSubmit={submit} onChange={clearNotice} noValidate className="relative max-w-3xl">
                        {/* Honeypot — off-screen, out of the tab order, hidden from AT.

                            IT WAS LABELLED "Company", AND THAT WAS A LEAK. Chrome
                            ignores `autoComplete="off"` and autofills anything that
                            looks like an organisation field, so a real visitor who
                            accepted autofill filled the trap, and the route — which
                            answers bots with a quiet success — dropped their
                            message. Nothing about this label or id looks like a
                            field a browser or password manager knows how to fill. */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
                        >
                            <label htmlFor={`${uid}-hp`}>Leave this empty</label>
                            <input
                                id={`${uid}-hp`}
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                data-1p-ignore
                                data-lpignore="true"
                                {...register("honeypot")}
                            />
                        </div>

                        {/* No column gap below `sm`: a two-track grid with a 2rem
                            gutter cannot be narrower than the gutter plus its
                            columns, and the fields stack down there anyway. */}
                        <fieldset
                            disabled={isSending}
                            className="grid gap-8 transition-opacity disabled:opacity-60 sm:grid-cols-2 sm:gap-x-8"
                        >
                            <div className="group">
                                <label htmlFor={`${uid}-name`} className={LABEL}>
                                    Name
                                </label>
                                <div className="relative">
                                    <input
                                        id={`${uid}-name`}
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Jane Doe"
                                        className={cn(FIELD, errors.name ? "border-danger" : "border-line-2")}
                                        {...a11y("name")}
                                        maxLength={CONTACT_LIMITS.name}
                                        enterKeyHint="next"
                                        onKeyDown={advanceOnEnter("name")}
                                        {...register("name")}
                                    />
                                    {validMark("name")}
                                </div>
                                {fieldError("name")}
                            </div>

                            <div className="group">
                                <label htmlFor={`${uid}-email`} className={LABEL}>
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        id={`${uid}-email`}
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        spellCheck={false}
                                        placeholder="jane@company.com"
                                        className={cn(FIELD, errors.email ? "border-danger" : "border-line-2")}
                                        {...a11y("email")}
                                        maxLength={CONTACT_LIMITS.email}
                                        autoCapitalize="off"
                                        enterKeyHint="next"
                                        onKeyDown={advanceOnEnter("email")}
                                        {...register("email")}
                                    />
                                    {validMark("email")}
                                </div>
                                {fieldError("email")}
                            </div>

                            <div className="group sm:col-span-2">
                                <label htmlFor={`${uid}-subject`} className={LABEL}>
                                    Subject <span className="text-ink-4">— optional</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id={`${uid}-subject`}
                                        type="text"
                                        autoComplete="off"
                                        placeholder="A new site, a contract role, a question"
                                        className={cn(FIELD, errors.subject ? "border-danger" : "border-line-2")}
                                        {...a11y("subject")}
                                        maxLength={CONTACT_LIMITS.subject}
                                        enterKeyHint="next"
                                        onKeyDown={advanceOnEnter("subject")}
                                        {...register("subject")}
                                    />
                                    {validMark("subject")}
                                </div>
                                {fieldError("subject")}
                            </div>

                            <div className="group sm:col-span-2">
                                <div className="flex items-baseline justify-between gap-4">
                                    <label htmlFor={`${uid}-message`} className={LABEL}>
                                        Message
                                    </label>
                                    {/* Counts toward the schema's ceiling, and only
                                        turns to the department's ink in the last
                                        tenth, where it starts to matter. */}
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "coord text-coord tnum transition-colors",
                                            messageLength > CONTACT_LIMITS.message * 0.9
                                                ? "text-[var(--tint-contact-ink)]"
                                                : "text-ink-4",
                                        )}
                                    >
                                        {messageLength} / {CONTACT_LIMITS.message}
                                    </span>
                                </div>
                                <textarea
                                    id={`${uid}-message`}
                                    rows={5}
                                    maxLength={CONTACT_LIMITS.message}
                                    placeholder="What are you building, and where do I fit in?"
                                    className={cn(
                                        FIELD,
                                        /* Grows with what is written instead of
                                           offering a drag handle, and scrolls past
                                           28rem. Where `field-sizing` is not yet
                                           supported it stays at five rows and
                                           scrolls. */
                                        "max-h-[28rem] min-h-32 resize-none [field-sizing:content]",
                                        errors.message ? "border-danger" : "border-line-2",
                                    )}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault();
                                            void submit();
                                        }
                                    }}
                                    {...a11y("message")}
                                    {...register("message")}
                                />
                                {fieldError("message")}
                            </div>
                        </fieldset>

                        <div className="mt-12 flex flex-col sm:flex-row sm:justify-end">
                            <Magnetic strength={0.2} innerStrength={0.08}>
                                <SendButton
                                    state={
                                        isSending ? "sending" : status.kind === "sent" ? "sent" : "idle"
                                    }
                                    refusals={refusals}
                                />
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
                                        variants={notice}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="flex items-center gap-2 border-l-2 border-ink py-1 pl-4 text-caption text-ink"
                                    >
                                        <CheckCircle size={16} weight="fill" aria-hidden />
                                        Sent. I&apos;ll get back to you soon.
                                    </m.p>
                                )}

                                {status.kind === "invalid" && (
                                    <m.p
                                        key="invalid"
                                        variants={notice}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="flex items-center gap-2 border-l-2 border-danger py-1 pl-4 text-caption text-danger"
                                    >
                                        <Warning size={16} weight="fill" aria-hidden />
                                        {status.count === 1
                                            ? "One field needs another look before this can send."
                                            : `${status.count} fields need another look before this can send.`}
                                    </m.p>
                                )}

                                {status.kind === "error" && (
                                    <m.p
                                        key="error"
                                        variants={notice}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
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

            {/* The art runs the full height of the department, heading
                to send, on the left, with the form on the right. It comes
                after the form in the DOM and is moved first only at `lg`,
                so below that — and for a screen reader at any width — the
                form comes first. */}
            <Reveal delay={0.1} className="lg:order-first lg:col-span-5">
                <ContactArt />
            </Reveal>
        </div>
    );
}
