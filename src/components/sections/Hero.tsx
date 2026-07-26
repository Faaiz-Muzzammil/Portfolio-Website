import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import Parallax from "@/components/motion/Parallax";

/**
 * The cover.
 *
 *     Engineers Build It.
 *     Marketers Sell It.
 *     ▓▓▓▓▓▓▓▓▓▓▓▓▓
 *     ▓ I Do Both. ▓
 *     ▓▓▓▓▓▓▓▓▓▓▓▓▓
 *
 *     Full-stack apps and AI agents, then the growth work
 *     that gets them used.
 *
 *     [ View Work ↓ ]  [ Read CV ↗ ]
 *
 * THE FIGURE. The copy is a rhetorical turn: two flat statements about other
 * people, then a third about the person whose site this is. The setting says
 * the same thing the words do. The first two lines are light, grey and
 * unremarkable — they are the premise, and a premise that fights for
 * attention is a premise nobody accepts. The third is heavier, larger, and
 * struck through with a block of ink carrying paper-coloured type: the
 * site's own inversion, at headline size.
 *
 * The block is not there when the line arrives. A second copy of the words,
 * ink-filled and paper-lettered, is laid exactly over the first and wiped in
 * from the left a beat later, so the letters invert as the edge passes them.
 * The line does not appear emphasised — it *becomes* emphasised, in front of
 * you, which is the difference between a design that states the joke and one
 * that lands it.
 *
 * SCALE. The two setup lines run to about two thirds of the measure — around
 * 125px on a 1920 display — and the turn is set a tenth larger again. It is
 * measured in `cqw` against its own column rather than in `vw`, because the
 * rails open at 1280 and eat width the viewport does not know it has lost.
 * The figure has come down twice from seven eighths: big type does not need
 * to be as big as it can be, and the third of the measure left over as
 * margin is what tells the eye the size was chosen rather than reached.
 *
 * The crescendo does two things at once. It makes the payoff physically the
 * biggest thing on the page rather than merely the boldest, and it stops the
 * block tapering: "I Do Both." is barely three fifths the width of the lines
 * above it, so at a single size the sentence ran out at the bottom instead
 * of landing. A tenth gives it a base without turning it into a second
 * headline.
 *
 * HIGHLIGHT. One, in the line under the statement, where the two halves of
 * "both" are lifted to full ink out of a grey sentence. It says the same
 * thing the headline says, one size down, and it is the only place on this
 * screen where anything is picked out.
 *
 * WHAT IS NOT HERE. No rules, no badges, no counts, no cards, no blob. Each
 * of those was tried on this screen and cut. A cover makes one claim; every
 * additional object on it is something to look at instead of the claim.
 *
 * HOW IT ARRIVES. Each line is clipped and slides up from below its own
 * baseline, 0.1s apart; the copy and the buttons fade up twelve pixels
 * behind them. Nothing large ever fades — at this size a crossfade shows the
 * reader half-drawn letterforms and reads as a font that has not loaded. All
 * of it is CSS, so the cover is animating on the first paint instead of
 * waiting to hydrate, and it is the same masked reveal `AnimatedText` gives
 * every department heading below.
 *
 * HOW IT LEAVES. Two parallax layers: the statement gives up a seventh of a
 * screen as the cover scrolls out, the copy and buttons half of that, both
 * fading. Depth is a difference — one layer moving is not parallax, it is a
 * moving layer. It is off below 768px, where a phone viewport is barely
 * shorter than the section and the drift has no distance to happen over.
 *
 * BELOW 1024px only the size changes. The type takes a larger share of the
 * measure — `cqw` holds a fixed *proportion*, and the thing that makes this
 * type feel enormous on a laptop is the width it has to itself, which a
 * narrow screen has none of to give. 8.8% of a 353px phone column is 31px:
 * the same proportion that reads as a statement across a desktop reads as
 * body copy on a phone. 12.5% is the ceiling that column allows.
 *
 * The breakpoint is `lg`, not `sm`. At `sm` a 700 or 800px window — a small
 * laptop, a tablet, a phone in landscape, a desktop browser dragged narrow —
 * was getting the wide-screen proportion in a column with none of the width
 * that proportion assumes.
 *
 * IT DOES NOT CENTRE. It did briefly, and it was wrong: the cover is one
 * left edge from the phone to the ultrawide, with the statement, the copy
 * and both buttons hanging off it. There is no grid on this screen, so that
 * edge does all the work a grid would, and centring the narrow case broke
 * the only alignment the design has. The optical corrections stay in place
 * at every width for the same reason — they are what holds the edge true.
 */

/* The three lines, and which of them turns. Authored breaks rather than a
   wrapped paragraph: the figure only works if the lines break exactly here,
   and `text-wrap` has no opinion about rhetoric. */
const LINES = [
    { text: "Engineers Build It.", turns: false },
    { text: "Marketers Sell It.", turns: false },
    { text: "I Do Both.", turns: true },
];

export default function Hero() {
    return (
        <div className="hero-stage relative isolate flex flex-col">
            <div aria-hidden className="hero-light" />

            {/* The wordmark that used to sit above this is gone. It was the
                one thing on the cover competing for the top of the screen
                with the fixed nav a few pixels above it, and the name is
                already carried by the rails, the footer and the title bar. A
                cover with a name at the top and a statement in the middle is
                a page introducing itself twice.

                `hero-col` is the query container the statement measures
                itself against. The full measure, because the statement is
                the cover and there is nothing beside it to leave room for.

                Ranged left at every width. The statement, the copy and both
                buttons hang off one edge from a phone to an ultrawide, and
                that edge is the only alignment on the screen — there is no
                grid here to belong to, so it does all the work a grid would.
                Only the type size changes below `lg`.

                The padding is tight on purpose. Three lines at this size plus
                copy plus buttons is about 670px on a 900px-tall laptop, where
                the stage is 672 — every gap on this screen is spent, and a
                generous `py` here is what pushes the buttons under the fold
                on exactly the machine most people will open this on. */}
            <div className="hero-col my-auto w-full py-8 sm:py-10">
                <Parallax depth={0.14} fade>
                    <h1
                        id="home-title"
                        className="hero-line text-balance text-ink-2"
                    >
                        {LINES.map((line, index) => (
                            <span
                                key={line.text}
                                /* The size lives on the mask, not on the text
                                   inside it: the mask's clearance for
                                   ascenders and descenders is set in `em`, so
                                   scaling the text without scaling the box
                                   would shear the tail off the "B". */
                                className={cn(
                                    "line-mask-display",
                                    line.turns && "hero-line-turn",
                                )}
                            >
                                <span
                                    className="line-up"
                                    style={{
                                        animationDelay: `${0.1 + index * 0.1}s`,
                                    }}
                                >
                                    {line.turns ? (
                                        <span className="hero-mark">
                                            {line.text}
                                            {/* The wiped copy. Hidden from
                                                assistive tech and from
                                                selection — it is the same
                                                three words, and nobody should
                                                hear or copy them twice. */}
                                            <span
                                                aria-hidden
                                                className="hero-mark-flip"
                                            >
                                                {line.text}
                                            </span>
                                        </span>
                                    ) : (
                                        line.text
                                    )}
                                </span>
                            </span>
                        ))}
                    </h1>
                </Parallax>

                <Parallax depth={0.07} fade>
                    {/* What "both" actually means, in one line. The statement
                        above is the position; this is the work. The two halves
                        of "both" are lifted to full ink out of a grey line —
                        the only highlight on the cover, and it is doing the
                        same job the headline is, one size down. */}
                    <p
                        className="rise mt-9 max-w-[42ch] text-lead text-pretty text-ink-3 sm:mt-11"
                        style={{ animationDelay: "0.5s" }}
                    >
                        <span className="text-ink">Full-stack apps and AI agents</span>
                        , then the{" "}
                        <span className="text-ink">growth work</span> that gets
                        them used.
                    </p>

                    {/* Side by side, on the same left edge as everything
                        above them. Two pills come to about 316px, which fits
                        every phone from a 375 up with margin to spare — and
                        full-width stacked bars, which is what this was, turn
                        two optional actions into a form. They wrap rather
                        than overflow on anything narrower. */}
                    <div
                        className="rise mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4"
                        style={{ animationDelay: "0.6s" }}
                    >
                        <Button
                            href="#work"
                            variant="accent"
                            size="lg"
                            className="rounded-full"
                            iconRight={
                                <ArrowDown size={16} weight="bold" aria-hidden />
                            }
                        >
                            View Work
                        </Button>

                        <Button
                            href="/cv.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            size="lg"
                            className="rounded-full"
                            iconRight={
                                <ArrowUpRight size={16} weight="bold" aria-hidden />
                            }
                        >
                            Read CV
                        </Button>
                    </div>
                </Parallax>
            </div>
        </div>
    );
}
