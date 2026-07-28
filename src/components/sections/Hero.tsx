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

/* ══════════════════════════════════════════════════════════════════════
   TOKENS
   Everything tunable lives here. Nothing below this block carries a
   hard-coded size, space or colour, so the hero can be retuned without
   touching a line of markup.
   ══════════════════════════════════════════════════════════════════════

   TYPE SCALE — major third, ratio 1.25, from a 16px base.

     1.00rem  16px     body            ← base
     1.25rem  20px     lead
     1.56rem  25px     —
     1.95rem  31px     display floor (375px)
     3.05rem  49px     —
     4.25rem  68px     display ceiling, single column
     6.50rem  104px    display ceiling, two column

   The display sizes are fluid between real rungs of that same ladder;
   `cqw` interpolates along it. Two figures, because the headline sits in
   the full measure below 1024px and in a column narrowed by the photo
   above it.

   THE PHOTO MADE THE HEADLINE BIGGER, which is the opposite of what
   adding an image to a hero usually does, and it is the whole reason
   this layout works. Going from two lines to three halves the longest
   line from 32 characters to 16 — so even after the photo takes a
   quarter of the measure, the type is sized against an 8em line instead
   of a 16em one. 9.5cqw of the narrowed column comes out around 90px
   where the two-line version was 82px in the full measure.

   SPACE SCALE — 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.

   COLOUR — the page's ink tokens, plus exactly one hue.

   THE ACCENT is vermilion, the second ink of two-colour letterpress: on
   a page built as a black-and-white printed sheet it is the one hue that
   reads as printing rather than as a framework's primary. `light-dark()`
   follows the `color-scheme` the theme already sets, darker on paper and
   brighter on the dark ground, so both clear AA — 5.15:1 on white,
   6.01:1 on black.

   It marks the turn and nothing else. */
const TOKENS = {
    /* Type */
    "--t-body": "1rem",
    "--t-lead": "1.25rem",
    "--t-display": "clamp(1.95rem, 11.5cqw, 4.25rem)",
    "--t-display-wide": "clamp(2.5rem, 9.5cqw, 6.5rem)",

    /* Space */
    "--s-1": "0.25rem",
    "--s-2": "0.5rem",
    "--s-3": "0.75rem",
    "--s-4": "1rem",
    "--s-6": "1.5rem",
    "--s-8": "2rem",
    "--s-12": "3rem",

    /* The figure's column. Floor and ceiling, so it can never thin into a
       strip too narrow to carry a person, nor widen far enough to start
       wrapping the setup lines. */
    "--fig-min": "15rem",
    "--fig-max": "24rem",

    /* Where the picture stops being a picture. Solid to 58%, gone by the
       foot — the shirt and the balcony wall are already near-black, so
       the grade finishes a dissolve the photograph starts on its own. */
    "--fig-fade": "58%",

    /* Colour — one hue, and only on the turn. */
    /* THE TWO THEMES GET TWO DIFFERENT BLOCKS, not one block at two
       brightnesses. A filled block is a light source on a dark page and a
       printed ink on a white one, and those are opposite jobs — running the
       same treatment on both made the light theme look like the dark one
       rendered badly.

         DARK   A luminous orange with near-black letters. The block is the
                brightest thing on the screen and the type is cut out of it.
                #E85C33 on #12100E — 5.43 : 1.

         LIGHT  A deep vermilion with paper-white letters. On white the
                block cannot out-glow the page, so it stops trying: it goes
                the other way and becomes ink, which is the inversion device
                the rest of this site already runs on every button and every
                heading. #C8401A on #FFFFFF — 5.00 : 1.

       So the letters flip and the block flips with them, and each theme
       gets the arrangement that is legible on its own ground. Neither can
       be expressed with `--ink` or `--paper`: those flip together, and what
       is needed here is one flipping against the other. */
    "--hero-accent": "light-dark(#C8401A, #E85C33)",
    "--hero-turn-ink": "light-dark(#FFFFFF, #12100E)",

    /* Motion. Longest path = 140ms delay + 440ms = 580ms. */
    "--m-line": "440ms",
    "--m-fade": "380ms",
    "--m-fig": "280ms",

    /* `--band-h` is the height of the head margin the left rail becomes on
       a narrow screen, and it is 0 above 1280px, so this expression is
       correct at every width. Without it the cover would be a full stage
       tall *inside* a body already inset by the band, and would overflow
       the screen by exactly its height.

       THE STAGE. 72svh is a floor, not a height: the text block is three
       beats tall now and the figure stretches to meet it, so on most
       screens the content sets the height and this never applies. It
       exists so the cover cannot collapse into a band on a very short
       window. It also leaves the Work rule just above the fold, which —
       with no proof block on this screen — is the only thing telling a
       stranger there is something behind the claim. */
    "--stage": "calc(72svh - var(--scroll-offset) - var(--band-h))",
} as CSSProperties;

const SOCIAL_ICONS = {
    github: GithubLogo,
    linkedin: LinkedinLogo,
    mail: EnvelopeSimple,
} as const;

/* One beat per line. Three masked rows, one for each beat of the figure,
   and the same three at every width — the responsive line-break that used
   to sit inside the setup is gone, because three lines is right on a
   phone and right on a 1920 alike.

   `turns` marks the payoff. It is the only row that takes the accent and
   the accent is the only thing that distinguishes it: same face, same
   weight, same size, same left edge. */
const BEATS = [
    { text: "Engineers Build.", turns: false, delay: "0ms" },
    { text: "Marketers Sell.", turns: false, delay: "70ms" },
    { text: "I Do Both.", turns: true, delay: "140ms" },
];

/**
 * The cover.
 *
 *     Engineers Build.          ┌──────────────┐
 *     Marketers Sell.           │              │
 *     I Do Both.        ← hue   │   [FIGURE]   │
 *                               │              │
 *     I ship full-stack apps…   │              │
 *                               │   ░░░░░░░░   │  ← graded out
 *     [ View Work ↓ ]  Read CV  └──────────────┘
 *     ○ ○ ○
 *
 * ── THE THREE BEATS ───────────────────────────────────────────────────
 *
 * Setup, setup, turn — one line each, and the structure is carried by the
 * line breaks rather than by decoration. The two setups are 16 and 15
 * characters: stacked flush left in one weight and one colour they form a
 * matched rectangle, and the eye reads them as a pair because they are
 * the same shape. The turn separates by being the only hue on the screen
 * and the only short line. That is one emphasis device, and position and
 * brevity — both free — do the rest.
 *
 * "Engineers Build." over "Engineers Build It." — the setups come out at
 * four syllables each against the turn's three, so the pair scans
 * identically and the turn lands short. "It" also refers forward to
 * nothing, which is a stumble on the most-read line of the site.
 *
 * ── THE FIGURE ────────────────────────────────────────────────────────
 *
 * It is anchored, not floated. Its top edge is the top edge of the first
 * masked row and its bottom edge is the bottom of the social row — the
 * grid stretches it between the two, so both anchors are structural and
 * neither can drift when the copy changes. The top stays hard because it
 * *is* an alignment; only the foot is graded.
 *
 * IT DOES NOT COMPETE FOR FIRST FIXATION. Three things see to that: it is
 * ranged right, where a left-to-right reader arrives last; it is
 * greyscale on a page whose only colour event is the line beside it; and
 * it enters 300ms after the headline has finished. The dissolve at its
 * foot also costs it the hard rectangle that would otherwise make it the
 * most object-like thing on the screen.
 *
 * ── WHAT IS NOT HERE ──────────────────────────────────────────────────
 *
 * No frame, border, offset block or shadow. No caption, registration
 * mark, roundel or drawn stroke. No parallax, tilt, hover reveal or
 * overlay. The graded foot is the only effect on the image and the
 * accent is the only colour on the page.
 */
export default function Hero() {
    return (
        <div
            style={TOKENS}
            className="flex flex-col justify-center min-h-(--stage) py-(--s-8)"
        >
            {/* The query container. The display type measures itself against
                this grid in `cqw`, so it holds a fixed proportion of the
                measure at every width. */}
            <div
                style={{ containerType: "inline-size" }}
                className="grid w-full items-stretch gap-(--s-12) lg:grid-cols-[minmax(0,1fr)_minmax(var(--fig-min),var(--fig-max))] lg:gap-[clamp(2rem,4vw,4rem)]"
            >
                <div>
                    {/* THE HEADLINE OPENS THE PAGE, with nothing above it.
                        An eyebrow sat here and has been cut: it was the first
                        thing the eye met on the site and it was a label, so
                        the first act of the cover was to introduce itself in
                        small grey mono before making its claim.

                        The eye lands on the setup because the setup is full
                        `--ink` at 21:1, the same weight and size as the turn.
                        The accent is only noticed once you arrive at it,
                        which is the order the rhythm needs.

                        The full sentence is intact in the accessibility tree:
                        three rows of plain text read straight through as
                        "Engineers Build. Marketers Sell. I Do Both." */}
                    <h1
                        id="home-title"
                        className="font-display font-normal leading-[1.04] tracking-[-0.035em] text-(length:--t-display) lg:text-(length:--t-display-wide)"
                    >
                        {BEATS.map((beat) => (
                            <span
                                key={beat.text}
                                className={
                                    beat.turns
                                        ? "line-mask-display hero-line-turn"
                                        : "line-mask-display"
                                }
                            >
                                <span
                                    className="line-up text-ink"
                                    /* The gaps widen — 0, 70, 140 — so the
                                       beat before the payoff is the longest.
                                       The stagger states the rhythm rather
                                       than emphasising the turn. */
                                    style={{
                                        animationDuration: "var(--m-line)",
                                        animationDelay: beat.delay,
                                    }}
                                >
                                    {/* The block is its own element rather
                                        than a class on the sliding row. That
                                        row carries `.line-up`, which sets
                                        `display: block` and is declared later
                                        in the stylesheet — so an
                                        `inline-block` on the same element
                                        loses the cascade and the highlight
                                        stretches the full width of the
                                        measure instead of shrinking to its
                                        three words. */}
                                    {beat.turns ? (
                                        <span className="hero-turn">
                                            {beat.text}
                                        </span>
                                    ) : (
                                        beat.text
                                    )}
                                </span>
                            </span>
                        ))}
                    </h1>

                    {/* One weight, one colour. Its only job is to cash the
                        "both" cheque with specifics — and "run the marketing"
                        deliberately echoes "Marketers Sell.", so the subhead
                        names the two halves in the headline's own words.
                        `--ink-2` is 9.6:1 on black, 11.2:1 on paper. */}
                    <p
                        className="rise mt-(--s-6) max-w-[46ch] text-(length:--t-lead) leading-[1.55] text-pretty text-ink-2"
                        style={{
                            animationDuration: "var(--m-fade)",
                            animationDelay: "200ms",
                        }}
                    >
                        I ship full-stack apps and AI agents, then run the
                        marketing that gets them used.
                    </p>

                    {/* One primary action. A filled button and a text link
                        that draws its rule on hover — the hierarchy is
                        unambiguous at a glance, and "Read CV" is still a real
                        anchor with a visible focus state. */}
                    <div
                        className="rise mt-(--s-8) flex flex-wrap items-center gap-(--s-6)"
                        style={{
                            animationDuration: "var(--m-fade)",
                            animationDelay: "250ms",
                        }}
                    >
                        <Button
                            href="#work"
                            variant="accent"
                            size="lg"
                            iconRight={<ArrowDown size={16} weight="bold" aria-hidden />}
                        >
                            View Work
                        </Button>

                        <a
                            href="/cv.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rule-draw inline-flex items-center gap-2 text-(length:--t-body) font-medium text-ink-2 transition-colors hover:text-ink"
                        >
                            Read CV
                            <ArrowUpRight size={15} weight="bold" aria-hidden />
                        </a>
                    </div>

                    {/* `--ink-3`, not `--ink-4`. Four is 2.9:1 on black,
                        which fails even the 3:1 floor for non-text; three is
                        5.3:1 and clears the text threshold outright. */}
                    <ul
                        className="rise mt-(--s-12) flex items-center gap-(--s-4)"
                        style={{
                            animationDuration: "var(--m-fade)",
                            animationDelay: "250ms",
                        }}
                    >
                        {socialLinks.map((link) => {
                            const Icon =
                                SOCIAL_ICONS[link.icon as keyof typeof SOCIAL_ICONS];

                            if (!Icon) return null;

                            return (
                                <li key={link.name}>
                                    <a
                                        href={link.url}
                                        target={link.icon === "mail" ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        aria-label={link.name}
                                        className="block p-1 text-ink-3 transition-colors hover:text-ink focus-visible:text-ink"
                                    >
                                        <Icon size={19} aria-hidden />
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* THE FIGURE — 1024px AND UP ONLY.
                    It drops out below that rather than stacking, and that is
                    a decision rather than a shortcut. On a phone the cover is
                    already spending every vertical pixel it has on three
                    lines of display type, a subhead, two actions and a social
                    row; a portrait inserted anywhere in that stack either
                    pushes the primary action under the fold or forces the
                    headline down a size. The photograph does no persuasive
                    work the headline is not already doing, and it appears
                    elsewhere on the site — so on a small screen it is the
                    thing that gives way.

                    `sizes` declares 1px below the breakpoint so that a
                    browser which fetches it anyway takes the smallest
                    candidate in the set rather than a desktop-width file. */}
                <figure className="relative hidden lg:block">
                    <Image
                        src="/portrait.jpeg"
                        alt={`${personalInfo.name} on a balcony in ${personalInfo.location}, the foothills and river valley behind him`}
                        fill
                        sizes="(min-width: 1024px) 24rem, 1px"
                        priority
                        /* `cover` against a container that is taller than the
                           3:4 source, so the crop takes the sides and leaves
                           the tonal split intact top to bottom — which is
                           what the graded foot depends on. 30% keeps the head
                           in the upper third and lets the near-black lower
                           half fall into the fade. */
                        className="rise object-cover object-[50%_30%] grayscale"
                        /* The shared `.rise` class rather than an inline
                           `animation`, so this inherits the two things that
                           come with it for free: the `js-loading` gate, which
                           holds the entrance until the page is actually on
                           screen, and the reduced-motion override. Only the
                           timing is set here — 300ms, so the figure arrives
                           after the headline has finished, never with it. */
                        style={{
                            animationDuration: "var(--m-fig)",
                            animationDelay: "300ms",
                            maskImage:
                                "linear-gradient(to bottom, #000 0%, #000 var(--fig-fade), transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, #000 0%, #000 var(--fig-fade), transparent 100%)",
                        }}
                    />
                </figure>
            </div>
        </div>
    );
}
