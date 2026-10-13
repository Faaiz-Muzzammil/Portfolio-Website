import type { CSSProperties } from "react";
import Image from "next/image";
import {
    ArrowDown,
    ArrowUpRight,
    EnvelopeSimple,
    GithubLogo,
    LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";

import { personalInfo, socialLinks } from "@/data";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import HeroBranch from "@/components/sections/HeroBranch";

/* ══════════════════════════════════════════════════════════════════════
   TOKENS
   Everything tunable lives here, so the cover can be retuned without
   touching the markup. The grid itself is `.hero-grid` in globals.css.

   The display size is measured in `cqw` against the grid, so the
   headline holds one proportion of the measure at every width. Two
   figures, because below `lg` the headline has the full measure and
   above it shares the row with the portrait. Both size the longest
   line, "Engineers build." (~6.1em at weight 300), to fill most of
   its column.

   Space runs on a 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
   ══════════════════════════════════════════════════════════════════════ */
const TOKENS = {
    "--t-display": "clamp(2.25rem, 13cqw, 4.5rem)",
    "--t-display-wide": "clamp(3.25rem, 7.4cqw, 6.25rem)",
    "--t-lead": "clamp(1.0625rem, 1.6cqw, 1.25rem)",

    "--s-2": "0.5rem",
    "--s-3": "0.75rem",
    "--s-4": "1rem",
    "--s-6": "1.5rem",
    "--s-8": "2rem",
    "--s-10": "2.5rem",
    "--s-12": "3rem",

    /* The plate: the portrait as its left half, the grained branch panel
       as its right, split at the centre so the pair is symmetrical about
       the seam. On a phone it sits above the headline with both halves
       4:5, capped so a tablet held upright does not turn it into a wall.
       At `lg` it is the right-hand column, as tall as everything to its
       left. */
    "--fig-plate": "28rem",
    "--fig-w": "clamp(26rem, 36vw, 38rem)",

    /* Motion. Longest path = 140ms delay + 440ms = 580ms. */
    "--m-line": "440ms",
    "--m-fade": "380ms",

    /* A floor, not a height: it stops the cover collapsing into a band
       on a short window and keeps the Work rule just under the fold. */
    "--stage": "calc(72svh - var(--scroll-offset))",
} as CSSProperties;

/* Setup, setup, turn — one line each. The two setups recede, light and
   grey; the turn is the only line in full ink and full weight. One
   emphasis device, carried by the variable weight axis alone. */
const BEATS = [
    { text: "Engineers build.", turns: false, delay: "0ms" },
    { text: "Marketers sell.", turns: false, delay: "70ms" },
    { text: "I do both.", turns: true, delay: "140ms" },
];

const SOCIAL_ICONS = {
    github: GithubLogo,
    linkedin: LinkedinLogo,
    mail: EnvelopeSimple,
} as const;

/* The links speak in the nav's voice — mono capitals — and the
   sentence and the things you press in the sans. */
const META = "font-mono text-eyebrow uppercase";

/**
 * The cover.
 *
 *     desktop                                  phone
 *
 *     Engineers build.        ┌─────┬─────┐   ┌─────┬─────┐
 *     Marketers sell.         │     │  ╱· │   │photo│ ─<  │
 *                             │     │ ╱─· │   └─────┴─────┘
 *     I do both.              │photo│──<  │   Engineers build.
 *     Lead line.              │     │ ╲─· │   Marketers sell.
 *     [ View work ↓ ]  Read CV│     │  ╲· │   I do both.
 *     GITHUB ↗  LINKEDIN ↗    └─────┴─────┘   Lead line.
 *                                              [ View work ↓ ]  Read CV ↗
 *                                              GITHUB ↗  LINKEDIN ↗  EMAIL
 *
 * Every element is content: what he says, where to go, and where to
 * find him. No rules, counters or ornaments.
 *
 * The plate is one object at every width: the portrait, and beside it a
 * grained panel with a branch growing out of the photo's edge and
 * fanning across it. On a desktop it runs the full height of the left column, from
 * the headline's first line to the foot of the social row, so the two
 * columns read as one block. On a phone it sits above the headline — a
 * face before the sentence.
 */
export default function Hero() {
    return (
        <div
            style={TOKENS}
            className="flex flex-col justify-center min-h-(--stage) py-(--s-8) lg:py-(--s-12)"
        >
            <div style={{ containerType: "inline-size" }} className="hero-grid w-full">
                {/* The faster layer, because it is the nearer object; the
                    type drifts at less than half its figure. Both are gated
                    off below 768px inside `Parallax`. `Parallax` wraps and
                    `Reveal` animates, so the two never write to one node. */}
                <Parallax depth={0.1} className="[grid-area:fig] lg:h-full">
                    <Reveal
                        as="figure"
                        scale
                        y={16}
                        delay={0.3}
                        className="flex max-w-(--fig-plate) overflow-hidden rounded-[4px] lg:h-full lg:max-w-none"
                    >
                        <div className="relative aspect-4/5 w-1/2 overflow-hidden bg-paper-2 lg:aspect-auto lg:h-full">
                            <Image
                                src="/portrait.jpeg"
                                alt={`${personalInfo.name} on a balcony in ${personalInfo.location}, the foothills and river valley behind him`}
                                fill
                                /* The width the photo is *drawn* at, not the
                                   width of its box. At `lg` the box is a tall
                                   half-column and `cover` scales the picture
                                   to its height, so it paints ~0.9× that
                                   height wide; on a phone the 1.45 zoom below
                                   widens it the same way. Asking for the box
                                   width fetched a file half the size it was
                                   shown at, which is what blurred it. */
                                sizes="(min-width: 1024px) 36rem, (min-width: 640px) 21rem, 75vw"
                                quality={90}
                                preload
                                /* At half a phone's width the whole figure is
                                   too small to read as a face, so the phone
                                   crop zooms in on the head and shoulders. */
                                className="origin-[52%_30%] scale-[1.45] object-cover object-[50%_30%] grayscale lg:scale-100"
                            />
                        </div>

                        {/* The plate's other half: the grained panel, with a
                            branch growing out of the photo's edge across it.
                            See `.hero-panel` and `HeroBranch`. */}
                        <div aria-hidden className="hero-panel relative aspect-4/5 w-1/2 overflow-hidden lg:aspect-auto lg:h-full">
                            <HeroBranch />
                        </div>
                    </Reveal>
                </Parallax>

                <Parallax depth={0.04} className="[grid-area:main] min-w-0">
                    {/* The full sentence is intact in the accessibility
                        tree: three rows of plain text read straight through
                        as "Engineers build. Marketers sell. I do both." */}
                    <h1
                        id="home-title"
                        className="font-display leading-[1.02] text-(length:--t-display) lg:text-(length:--t-display-wide)"
                    >
                        {BEATS.map((beat) => (
                            <span key={beat.text} className="line-mask-display">
                                <span
                                    className={
                                        beat.turns
                                            ? "line-up font-bold tracking-[-0.045em] text-ink"
                                            : "line-up font-light tracking-[-0.035em] text-ink-3"
                                    }
                                    /* The gaps widen — 0, 70, 140 — so the
                                       beat before the payoff is the longest. */
                                    style={{
                                        animationDuration: "var(--m-line)",
                                        animationDelay: beat.delay,
                                    }}
                                >
                                    {beat.text}
                                </span>
                            </span>
                        ))}
                    </h1>

                    {/* Cashes the headline's "both" with the specifics, in
                        one line. */}
                    <p
                        className="rise mt-(--s-6) max-w-[34ch] text-(length:--t-lead) leading-normal text-pretty text-ink-2"
                        style={{
                            animationDuration: "var(--m-fade)",
                            animationDelay: "200ms",
                        }}
                    >
                        Full-stack apps and AI agents, plus the growth work that gets them used.
                    </p>

                    {/* One primary action and a quiet text link beside it. */}
                    <div
                        className="rise mt-(--s-8) flex flex-wrap items-center gap-x-(--s-6) gap-y-(--s-4)"
                        style={{
                            animationDuration: "var(--m-fade)",
                            animationDelay: "250ms",
                        }}
                    >
                        <Button
                            href="#work"
                            variant="accent"
                            className="[--nudge-x:0] [--nudge-y:0.2rem]"
                            iconRight={<ArrowDown size={15} weight="bold" aria-hidden />}
                        >
                            View work
                        </Button>

                        {/* `active:` as well as `hover:` — an inline text
                            link must not scale on press, so the press is
                            the same colour move the hover makes. */}
                        <a
                            href="/cv.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rule-draw inline-flex items-center gap-(--s-2) text-[0.875rem] font-medium text-ink-2 transition-colors hover:text-ink active:text-ink"
                        >
                            Read CV
                            <ArrowUpRight size={14} weight="bold" aria-hidden />
                        </a>
                    </div>

                    {/* Named, not just drawn. Three bare glyphs at 19px read
                        as furniture; a word beside each one is a link you can
                        see the destination of. */}
                    <ul
                        className={`rise mt-(--s-10) flex flex-wrap gap-x-(--s-6) gap-y-(--s-3) lg:mt-(--s-12) ${META}`}
                        style={{
                            animationDuration: "var(--m-fade)",
                            animationDelay: "300ms",
                        }}
                    >
                        {socialLinks.map((link) => {
                            const Icon = SOCIAL_ICONS[link.icon as keyof typeof SOCIAL_ICONS];
                            if (!Icon) return null;
                            const external = link.icon !== "mail";

                            return (
                                <li key={link.name}>
                                    <a
                                        href={link.url}
                                        target={external ? "_blank" : undefined}
                                        rel={external ? "noopener noreferrer" : undefined}
                                        className="rule-draw inline-flex items-center gap-(--s-2) py-1 text-ink-2 transition-colors hover:text-ink focus-visible:text-ink active:text-ink"
                                    >
                                        <Icon size={16} aria-hidden />
                                        {link.name}
                                        {external && <ArrowUpRight size={11} weight="bold" aria-hidden />}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </Parallax>
            </div>
        </div>
    );
}
