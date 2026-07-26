"use client";

import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import {
    ArrowUpRight,
    CaretDown,
    CheckCircle,
    Microphone,
    PaperPlaneTilt,
    Warning,
} from "@phosphor-icons/react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { personalInfo } from "@/data";
import { cn } from "@/lib/cn";
import { CONTACT_TOPICS, contactSchema, type ContactInput } from "@/lib/validation/contact";
import RunningHead from "@/components/ui/RunningHead";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";

type Status =
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "error"; message: string; mailto?: string };

/* Underline fields. The resting rule is a hairline; focus thickens it to full
   ink, which is how everything else on a monochrome page says "active". */
const FIELD =
    "peer w-full border-x-0 border-t-0 border-b bg-transparent px-0 py-3 text-body text-ink " +
    "outline-none transition-colors duration-300 placeholder:text-ink-4 focus:border-accent";

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
        defaultValues: { name: "", email: "", topic: "", message: "", honeypot: "" },
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

    const labelClass = "coord mb-2 block text-coord text-ink-3";

    return (
        <div>
            <RunningHead
                id="contact-title"
                number="04"
                name="Contact"
                meta="Replies within a day"
                title="Tell me what you're"
                accentTitle="building."
            />

            {/* No column gap below `sm` — eleven 2rem gutters are a 352px
                floor the grid cannot go under, which is wider than a phone's
                whole column. See Projects. */}
            <div className="grid grid-cols-12 gap-y-12 sm:gap-x-8">
                <div className="col-span-12 lg:col-span-4">
                    <Reveal y={16} className="max-w-[38ch]">
                        <p className="text-body text-pretty text-ink-2">
                            Freelance or full-time, or just a question about something
                            further up the page — all of it reaches me.
                        </p>
                    </Reveal>

                    {/* Who you are actually writing to. Three blocks of the
                        same shape — a rule, a coord label, the thing — so the
                        column reads as one stack rather than three ideas.
                        `stagger` animates the children, which is why the
                        anchor can stay an anchor: `Reveal` renders its own
                        tag and forwards nothing, so wrapping a link in it
                        would drop the href. */}
                    <Reveal delay={0.12} stagger={0.08} className="mt-8">
                        <div className="flex items-center gap-4 border-t border-line pt-6">
                            <span className="relative size-14 shrink-0 overflow-hidden bg-surface-2">
                                <Image
                                    src="/Faaiz.jpeg"
                                    alt=""
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                />
                            </span>
                            <span className="min-w-0">
                                <span className="display block text-h3 text-ink">
                                    {personalInfo.name}
                                </span>
                                {/* An "open to work" badge lived here too. The
                                    whole section is an invitation to write;
                                    labelling it as well reads as a plea. */}
                                <span className="coord mt-2 block text-coord text-ink-3">
                                    {personalInfo.role} · {personalInfo.location}
                                </span>
                            </span>
                        </div>

                        <a
                            href={`mailto:${personalInfo.email}`}
                            className="group/mail mt-8 block border-t border-line pt-6"
                        >
                            <span className="coord block text-coord text-ink-3">Email</span>
                            <span className="mt-2.5 flex items-baseline justify-between gap-3">
                                {/* An ink-to-ink colour swap on hover would be
                                    no change at all now, so the link draws a
                                    rule. It wraps rather than truncating — a
                                    half-shown address is worse than a two-line
                                    one. */}
                                <span className="rule-draw min-w-0 break-all text-lead text-ink">
                                    {personalInfo.email}
                                </span>
                                <ArrowUpRight
                                    size={16}
                                    weight="bold"
                                    aria-hidden
                                    className="flex-none translate-y-0.5 text-ink-4 transition-[transform,color] duration-400 group-hover/mail:translate-x-0.5 group-hover/mail:translate-y-0 group-hover/mail:text-ink"
                                />
                            </span>
                        </a>

                        <div className="mt-8 border-t border-line pt-6">
                            <span className="coord block text-coord text-ink-3">Voice</span>
                            <p className="mt-2.5 flex items-start gap-2.5 text-body text-ink-2">
                                <Microphone
                                    size={16}
                                    aria-hidden
                                    className="mt-1 flex-none text-ink-4"
                                />
                                <span>
                                    Say{" "}
                                    <span className="text-accent-ink">
                                        &ldquo;contact Faaiz&rdquo;
                                    </span>{" "}
                                    to the mic in the top bar.
                                </span>
                            </p>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={0.08} className="col-span-12 lg:col-span-7 lg:col-start-6">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="relative border-t border-ink pt-7"
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

                        <div className="grid gap-6 sm:grid-cols-2 sm:gap-7">
                            <div>
                                <label htmlFor={`${uid}-name`} className={labelClass}>
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

                            <div>
                                <label htmlFor={`${uid}-email`} className={labelClass}>
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

                        <div className="mt-6 sm:mt-7">
                            <label htmlFor={`${uid}-topic`} className={labelClass}>
                                Topic
                            </label>
                            <div className="relative">
                                <select
                                    id={`${uid}-topic`}
                                    className={cn(
                                        FIELD,
                                        "appearance-none pr-8",
                                        errors.topic ? "border-danger" : "border-line-2",
                                    )}
                                    {...a11y("topic")}
                                    {...register("topic")}
                                >
                                    {CONTACT_TOPICS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <CaretDown
                                    size={14}
                                    weight="bold"
                                    aria-hidden
                                    className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-ink-4"
                                />
                            </div>
                            {fieldError("topic")}
                        </div>

                        <div className="mt-6 sm:mt-7">
                            <label htmlFor={`${uid}-message`} className={labelClass}>
                                Message
                            </label>
                            <textarea
                                id={`${uid}-message`}
                                rows={4}
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

                        {/* No rule above this. The textarea already closes the
                            form with its own underline, and a second hairline
                            30px below it read as a mistake. */}
                        <div className="mt-9">
                            <Magnetic strength={0.2} innerStrength={0.08}>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="group/send relative inline-flex h-13 w-full items-center justify-center gap-2.5 overflow-hidden bg-accent px-7 text-[0.9375rem] font-medium text-accent-fg transition-transform duration-300 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
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

                        <div role="status" aria-live="polite" className="mt-4 empty:hidden">
                            <AnimatePresence mode="wait">
                                {status.kind === "sent" && (
                                    <m.p
                                        key="sent"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 border border-accent-line bg-accent-soft px-3.5 py-3 text-caption text-accent-ink"
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
                                        className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border border-danger/40 bg-danger-soft px-3.5 py-3 text-caption text-danger"
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
        </div>
    );
}
