"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

import Reveal from "@/components/motion/Reveal";

const SITE_URL = "https://www.marketeer.studio";

/**
 * The product demo, playing only while it is on screen.
 *
 * Muted, looped and inline so every browser will autoplay it. It is paused
 * whenever it scrolls out of view — a 1080p decode running under the rest of
 * the page is frames taken off the scroll for nobody — and it never starts
 * by itself for a reader who has asked for reduced motion: they get the
 * poster and the native controls, as does anyone whose browser refuses
 * autoplay.
 */
function DemoVideo() {
    const ref = useRef<HTMLVideoElement>(null);
    const [controls, setControls] = useState(false);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        // React sets `muted` as a property after hydration rather than
        // rendering the attribute, and iOS checks for it before it will
        // autoplay — so it is set here, before the first play().
        video.muted = true;
        video.defaultMuted = true;

        // Reduced motion never starts it; the reader gets the poster and a
        // play button, so the demo is still theirs to watch.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setControls(true);
            return;
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Low Power Mode and data savers refuse autoplay outright.
                    // A refused play() would otherwise leave a still frame
                    // with no way to start it, so hand over the controls.
                    video.play().catch(() => setControls(true));
                } else if (!video.controls) {
                    video.pause();
                }
            },
            { threshold: 0.25 },
        );
        io.observe(video);
        return () => io.disconnect();
    }, []);

    return (
        <video
            ref={ref}
            src="/marketeer/demo.mp4"
            poster="/marketeer/demo-poster.webp"
            muted
            loop
            playsInline
            controls={controls}
            preload="metadata"
            aria-label="Marketeer demo: a live Nvidia market tile is picked and the branded video is built and edited in the studio"
            className="block aspect-video h-auto w-full"
        />
    );
}

const AWARDS = [
    {
        crest: "/marketeer/crest-bahria.webp",
        title: "1st Place, Final Year Project",
        event: "Bahria University · Open House 2026",
    },
    {
        crest: "/marketeer/crest-namal.webp",
        title: "Winner, Best Final Year Project",
        event: "Namal University · NamalTech 2026",
    },
    {
        crest: "/marketeer/crest-nust.webp",
        title: "Appreciation Award, Software Development",
        event: "NUST · COMPPEC 2026",
    },
];

/**
 * The capstone, bound in at the foot of Work as an insert.
 *
 * Everything above it is an index row; Marketeer gets a sheet of its own
 * stock — the deck's ground, cream type and one lime — but keeps the issue's
 * devices inside it: mono labels, hairline rules, weight carrying the
 * emphasis. `globals.css` has the notes on the colour.
 */
export default function Marketeer() {
    return (
        <article aria-labelledby="marketeer-title" className="marketeer mt-20 sm:mt-28">
            <div className="px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                {/* The head, on the same split as the index rows above it:
                    the title owns the first seven columns and the copy
                    starts at the eighth, dropped to the title's foot so
                    the two finish on one line. */}
                <Reveal className="grid grid-cols-12 gap-y-8 lg:gap-x-10">
                    <div className="col-span-12 lg:col-span-7">
                        <p className="coord flex items-center gap-2 text-coord text-(--mk-accent)">
                            <Sparkle size={12} weight="fill" aria-hidden />
                            Capstone project
                            <span aria-hidden className="size-0.5 bg-current opacity-60" />
                            2025—26
                        </p>

                        <h3
                            id="marketeer-title"
                            className="display-axis mt-6 max-w-[16ch] text-h2 text-balance"
                        >
                            Marketeer turns live data into publish&#8209;ready content{" "}
                            <strong className="mk-underline whitespace-nowrap">in seconds.</strong>
                        </h3>
                    </div>

                    <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:self-end">
                        <p className="max-w-[44ch] text-body text-pretty text-(--mk-ink-2)">
                            Our final year capstone, built with Marketverse Inc. Live feeds
                            become branded posts, videos and newsletters — on brand, approved
                            by a person, in under a minute.
                        </p>

                        <a
                            href={SITE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mk-button group/mk relative isolate mt-6 inline-flex h-10 items-center gap-2 overflow-hidden px-4 text-[0.8125rem] font-medium active:scale-[0.98]"
                        >
                            Visit marketeer.studio
                            <ArrowUpRight
                                size={14}
                                weight="bold"
                                aria-hidden
                                className="transition-transform duration-400 group-hover/mk:-translate-y-0.5 group-hover/mk:translate-x-0.5"
                            />
                        </a>
                    </div>
                </Reveal>

                {/* The demo across the full measure: it is a 16:9 screen
                    recording, and anything narrower leaves the app's own
                    type too small to read. A hairline frames it on the
                    light sheet, where its dark edges would otherwise bleed. */}
                <Reveal scale className="mt-10 sm:mt-14">
                    <div className="overflow-hidden bg-(--mk-tile) shadow-[0_0_0_1px_var(--mk-line-2)]">
                        <DemoVideo />
                    </div>
                </Reveal>

                {/* The awards as a footnote to the plate, one per column,
                    rather than a stack competing with the headline. */}
                <Reveal
                    as="ul"
                    stagger={0.08}
                    className="mt-10 grid gap-x-10 sm:mt-12 md:grid-cols-3"
                >
                    {AWARDS.map((a) => (
                        <li
                            key={a.event}
                            className="flex items-start gap-3.5 border-t border-(--mk-line) py-5"
                        >
                            <span className="mk-crest grid size-9 shrink-0 place-items-center rounded-full p-1">
                                <Image
                                    src={a.crest}
                                    alt=""
                                    width={64}
                                    height={64}
                                    sizes="36px"
                                    className="size-full object-contain"
                                />
                            </span>
                            <span className="min-w-0 pt-0.5">
                                <span className="block text-caption leading-snug font-medium text-(--mk-ink)">
                                    {a.title}
                                </span>
                                <span className="coord mt-1.5 block text-coord text-(--mk-ink-3)">
                                    {a.event}
                                </span>
                            </span>
                        </li>
                    ))}
                </Reveal>
            </div>
        </article>
    );
}
