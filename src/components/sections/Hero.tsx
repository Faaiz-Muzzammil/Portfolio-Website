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

    /* THE LEAD IS FLUID NOW; IT WAS A FLAT 1.25rem. Twenty pixels is
       right under a 68px headline and wrong under a 37px one — on a
       phone it put the subhead within 1.8× of the display line, which
       is not a step, it is two sizes of type in the same neighbourhood
       arguing about which one is the headline.

       It was also the one type size on this cover that did not scale.
       Everything else is measured in `cqw` against the grid container,
       so the whole composition holds its proportions as the screen
       changes and then the subhead alone stayed put and broke them.

       17px on a phone against a ~37px display line is a clean 2.2×;
       21px at full width against 68px is 3.2×. Both read as a heading
       and a standfirst rather than as two headings. The floor is still
       a full point above body copy, so it never stops being a lead. */
    "--t-lead": "clamp(1.0625rem, 3.6cqw, 1.3125rem)",
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

    /* A `--fig-fade` lived here, and then briefly in a `.fig-grade` class
       so it could differ per breakpoint. Both are gone with the mask —
       the picture now ends where it ends. */

    /* ---- The turn block: ink and paper, and no hue at all -----------
       THE COVER HAS NO COLOUR NOW, which finally makes it agree with
       the rest of the site. "The cover is not a colour" is the rule the
       department inks are built on — `home` has no entry in either tint
       set, the nav's marker falls back to solid ink there, and the
       margins stay neutral. The one thing that had never been told was
       the cover itself, which was carrying a vermilion block: the only
       hue on the site, on the one screen the tint system exempts.

       `--ink` ON `--paper` IS THE SAME DEVICE EVERY OTHER CONTROL HERE
       USES. A thing that matters is a solid block of ink with
       paper-coloured type cut out of it — the buttons do it, the nav's
       CTA does it, the footer's icons do it on hover. The turn now does
       it too, at 96px.

       IT NEEDS NO PER-THEME BRANCH, and that is what makes it right
       rather than merely quieter. The old pair could not be expressed
       in these tokens: an orange block wants near-black letters on a
       dark page and paper-white ones on a light page, so the two ends
       had to move independently and were pinned by hand with
       `light-dark()` — two hexes, two contrast ratios, checked twice.
       Ink and paper already invert together against whichever ground is
       under them. Black block with white letters on the white theme,
       white block with black letters on the black one — 20.4:1 and
       21:1 — and nothing to keep in sync. */
    "--hero-accent": "var(--ink)",
    "--hero-turn-ink": "var(--paper)",

    /* Motion. Longest path = 140ms delay + 440ms = 580ms. */
    "--m-line": "440ms",
    "--m-fade": "380ms",
    "--m-fig": "280ms",

    /* THE STAGE. 72svh is a floor, not a height: the text block is three
       beats tall and the figure stretches to meet it, so on most screens
       the content sets the height and this never applies. It exists so
       the cover cannot collapse into a band on a very short window. It
       also leaves the Work rule just above the fold, which — with no
       proof block on this screen — is the only thing telling a stranger
       there is something behind the claim.

       ON A PHONE IT NOW NEVER APPLIES AT ALL, because the portrait band
       is stacked under the copy and the cover is comfortably past 72svh
       on its own. That is the intended outcome rather than a floor being
       overshot: the fold lands somewhere in the band, so the first thing
       a phone reader does is scroll *into a photograph* — which is a
       better reason to keep going than a rule at the bottom of a screen
       of type. `justify-center` stops mattering for the same reason;
       there is no slack left to centre. */
    "--stage": "calc(72svh - var(--scroll-offset))",
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
                /* `--s-8` between the stack and the band, not `--s-12`. Three
                   rems of air below the social row read as the cover ending
                   and a photograph starting; two keeps the band attached to
                   the copy it belongs to. At `lg` the gap is horizontal and
                   goes back to its own clamp. */
                className="grid w-full items-stretch gap-(--s-8) lg:grid-cols-[minmax(0,1fr)_minmax(var(--fig-min),var(--fig-max))] lg:gap-[clamp(2rem,4vw,4rem)]"
            >
                {/* ---- THE TWO LAYERS THAT MAKE THE DEPTH ----------------
                    `Parallax` was in the codebase and wired to nothing. Its
                    own doc describes a cover running "the sentence at 0.14
                    and the paragraph and buttons at 0.07" — a composition
                    that had been unwired at some point without the component
                    going with it. This is the first use on the site.

                    IT IS ON BOTH COLUMNS, AT DIFFERENT FIGURES, and that is
                    not optional. Depth is a *difference*: one layer drifting
                    while everything around it holds still is not parallax,
                    it is an element that has come loose. The type leaves at
                    0.05 of a viewport and the portrait at 0.12, so the
                    picture pulls away from the words as the cover exits and
                    the flat page reads as having a near and a far.

                    THE PORTRAIT IS THE FASTER LAYER because it is the nearer
                    object. Run it the other way — type faster than the
                    photograph behind it — and the depth inverts: the page
                    reads as a picture hanging in front of the headline,
                    which is the one relationship the composition does not
                    have.

                    BOTH FIGURES ARE SMALL ON PURPOSE. Half a screen of drift
                    is a slideshow; a twentieth and an eighth are things you
                    feel rather than watch, and the difference between them —
                    which is the only part that matters — is still plain.

                    IT DOES NOT RUN ON A PHONE. `Parallax` gates itself at
                    768px, on the reasoning that a phone's viewport is barely
                    shorter than its section so there is no scroll distance
                    for the drift to happen over. That reasoning is now
                    weaker here than it was — the cover is a good deal taller
                    than a phone screen since the portrait went full-height —
                    but the gate is the component's, shared by every future
                    call site, and the other half of its argument still
                    stands: a scrubbed tween per layer, on the least powerful
                    hardware there is. Lower it there if it is ever wanted,
                    not here. */}
                <Parallax depth={0.05} className="min-w-0">
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
                        {/* One line, three beats, and it is deliberately the
                            only thing on the cover that does not resolve
                            further down the page. Everything else here is
                            checkable — the projects, the roles, the numbers.
                            This is the voice. Keep it short; the moment it
                            starts explaining itself it stops being the
                            voice. */}
                        Busy building stuff, marketing and winning awards.
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
                            /* `active:text-ink` as well as `hover:`. An inline
                               text link is the one control that must not
                               scale on press — a word that shrinks under the
                               finger reads as a rendering fault — so the
                               press is the same colour move the hover makes,
                               which is also the only feedback a touch device
                               gets here at all. */
                            className="rule-draw inline-flex items-center gap-2 text-(length:--t-body) font-medium text-ink-2 transition-colors hover:text-ink active:text-ink"
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
                                        className="block p-1 text-ink-3 transition-[color,transform] duration-300 hover:text-ink focus-visible:text-ink active:scale-[0.92] active:text-ink motion-reduce:active:scale-100"
                                    >
                                        <Icon size={19} aria-hidden />
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </Parallax>

                {/* THE FIGURE, AND IT NOW APPEARS AT EVERY WIDTH.
                    It used to be `hidden lg:block`, on the argument that a
                    phone's cover is already spending every vertical pixel it
                    has on three lines of display type, a subhead, two actions
                    and a social row — and that a portrait dropped into that
                    stack pushes the primary action under the fold.

                    That argument is only true if the portrait goes *into* the
                    stack. It does not: it comes after all of it. The order on
                    a phone is headline, subhead, actions, socials, portrait,
                    so nothing above it moves by a pixel and "View Work" sits
                    exactly where it sat before. What the image costs is scroll
                    depth below the fold, which is the one thing a cover has in
                    unlimited supply.

                    THE BOX IS THE FILE'S OWN RATIO — 1165 × 1280 — SO NOTHING
                    IS CROPPED. Two landscape bands were tried here first, 3:2
                    and then 4:3, on the reasoning that a phone cannot afford
                    a full-height portrait. Both cut the picture in half, and
                    the reason is worth recording because it was not a matter
                    of taste: the comment beside this image asserted a 3:4
                    source and the file is 0.91 — very nearly square. Every
                    crop figure downstream had been derived from a number
                    nobody had checked, so a "band" that should have shown a
                    wide slice through the face was instead showing the top
                    two thirds of a nearly-square frame.

                    Measure the asset. At its real ratio `object-cover` has
                    nothing to cut, the whole photograph is on screen, and no
                    focal point is needed at all. On a 360px phone that is
                    ~396px tall — a full plate rather than a band, which is
                    more than the earlier reasoning wanted to spend and is
                    what showing a picture whole actually costs.

                    THE DESKTOP COLUMN IS UNAFFECTED. There the box is a tall
                    grid cell, the crop is real, and `50% 30%` still keeps the
                    head in the upper third.

                    THE GRADED FOOT IS GONE AND `.plate` REPLACED IT. The mask
                    that used to dissolve the bottom of this image was hiding
                    a problem rather than solving one: the photograph grades
                    to near-black and the dark theme's ground *is* black, so
                    the plate had no visible lower edge, and fading the whole
                    foot out made that look deliberate. It is a hairline and
                    two crop marks now — an edge where the edge is, and the
                    picture kept whole. See `.plate` in `globals.css`.

                    `sizes` says `100vw` below the breakpoint now, not `1px`.
                    That 1px was there to stop a browser that fetched the
                    image anyway from taking a desktop-width file for a
                    hidden element; with the figure genuinely rendered, it
                    would have picked the smallest candidate in the set and
                    scaled it across the full width of a phone. */}
                {/* IT ARRIVES WHEN YOU REACH IT, WHICH IT DID NOT BEFORE.
                    The image carried `.rise` — a CSS entrance that starts
                    counting from page load with a 300ms delay. On a desktop
                    that is right: the figure is a column beside the headline,
                    above the fold, and it lifts in a beat after the type. On
                    a phone the same class was playing to nobody. The band is
                    below the fold, so its entrance ran and finished while the
                    reader was still looking at the headline, and by the time
                    they scrolled down the photograph was simply *there* —
                    inert, already arrived, the one still object at the foot
                    of a page where everything else moves as you reach it.

                    `Reveal` fires on a ScrollTrigger instead, so the arrival
                    happens at the moment the image is actually seen. Above
                    the fold on a desktop the trigger is already satisfied at
                    load and it behaves exactly as it did; on a phone it waits
                    for the scroll. One mechanism, correct at both sizes,
                    rather than a load-timed animation guessing where the fold
                    is.

                    `as="figure"` so this is still a `<figure>` with a
                    `<figcaption>` — the wrapper is the element, not a div
                    around it. `scale` adds the 0.98 → 1 settle to the fade,
                    which on a photograph reads as the plate being pressed
                    onto the page. */}
                {/* The nearer layer, at more than twice the type's figure —
                    see the note on the text column. `Parallax` wraps rather
                    than animates, so its transform and the `Reveal`
                    entrance below it are on separate nodes and never write
                    to the same element. */}
                <Parallax depth={0.12} className="w-full lg:h-full lg:w-auto">
                <Reveal as="figure" scale y={20} delay={0.3} className="w-full lg:h-full lg:w-auto">
                    {/* The aspect box wraps the plate and nothing else. The
                        caption is a sibling below it — put inside, it would
                        sit over a `fill` image and count against the ratio
                        the box exists to hold. At `lg` the ratio gives way to
                        `h-full` and the column's own height takes over. */}
                    <div className="plate relative aspect-1165/1280 w-full lg:aspect-auto lg:h-full">
                        <Image
                            src="/portrait.jpeg"
                            alt={`${personalInfo.name} on a balcony in ${personalInfo.location}, the foothills and river valley behind him`}
                            fill
                            sizes="(min-width: 1024px) 24rem, 100vw"
                            priority
                            /* NO CROP ON A PHONE. The box is the file's own
                               ratio, so `cover` has nothing to cut and no
                               focal point is needed — the whole photograph is
                               on screen. At `lg` the box is a tall column
                               instead and the crop comes back, taking the
                               sides and keeping the head in the upper third.

                               No `.rise` and no inline `animation` any more:
                               the entrance belongs to the `Reveal` around this
                               now, and two entrances on one element fight. */
                            className="object-cover grayscale lg:object-[50%_30%]"
                        />
                    </div>

                    {/* A `<figcaption>` was tried here on phones — the name,
                       a rule across, the place, in the department heads' own
                       plate line. It is gone: the picture is the last thing
                       on the cover and a line of grey mono under it was one
                       more object between the reader and the Work rule. The
                       `alt` still names both. */}
                </Reveal>
                </Parallax>
            </div>
        </div>
    );
}
