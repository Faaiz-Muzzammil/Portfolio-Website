/**
 * The share card — what a link to this site unfurls into in WhatsApp,
 * iMessage, Slack, LinkedIn and X.
 *
 * ── WHY THIS IS NOT THE CARD THAT WAS HERE ────────────────────────────
 *
 * The previous one was drawn against the site's old palette: a warm grey
 * ground, a purple accent and an orange signal. None of those three
 * colours exist on the site any more — it was rebuilt monochrome, with
 * emphasis carried by weight and inversion rather than hue. The card had
 * also kept a headline ("I build the thing, then I get it used.") that
 * the cover no longer says. So the one asset a stranger sees *before*
 * they decide whether to open the link was advertising a different
 * website.
 *
 * It also set everything in `sans-serif`, which in Satori means its
 * built-in fallback. A share card in a system grotesque is the visual
 * equivalent of a default favicon: nothing is wrong with it and nothing
 * about it was chosen. The real faces are loaded below.
 *
 * ── THE COMPOSITION ───────────────────────────────────────────────────
 *
 * It is a department opening, which is what every other page on this
 * site is:
 *
 *     FAAIZ MUZZAMMIL              ISLAMABAD, PAKISTAN   ← running head
 *     ═══════════════════════════════════════════════    ← 2px ink rule
 *
 *     Engineers Build.                                   ← 300
 *     Marketers Sell.                                    ← 300
 *     I Do Both.                                         ← 800
 *
 *     ───────────────────────────────────────────────    ← hairline
 *     FULL-STACK · AI AGENTS · GROWTH    ▪ OPEN TO WORK
 *
 * Two typefaces and no third. Emphasis is the 300 → 800 step on the last
 * beat and nothing else, because that is the site's one device and it is
 * the reason Bricolage was chosen in the first place.
 *
 * IT IS PAPER-WHITE IN BOTH THEMES. The site has a dark mode and this
 * card deliberately does not follow it: a card is composited onto
 * whatever ground the chat app happens to use, a preview is cached by
 * the platform for months, and there is no media query to read at the
 * moment it is baked. White is the one ground that stays legible in a
 * dark thread and a light one.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

export const SIZE = { width: 1200, height: 630 };

const PAPER = "#FFFFFF";
const INK = "#0A0A0A";
const INK_3 = "#6E6E6E";
const HAIRLINE = "rgba(10, 10, 10, 0.14)";

const DISPLAY = "Bricolage Grotesque";
const MONO = "Geist Mono";

/**
 * Satori does not interpolate a variable axis — it renders whatever
 * instance it is handed — so these are the static cuts Google serves for
 * `opsz 96, wght 300` and `opsz 96, wght 800`. The optical size matters:
 * the text cut of this face at 100px looks slack, and the display cut is
 * what the cover gets in the browser.
 *
 * They are read off disk rather than fetched. Every route that draws a
 * card is prerendered — the home page is static and the project pages
 * are `generateStaticParams` with `dynamicParams = false` — so this runs
 * at build time, where the repository is unambiguously present. The
 * `outputFileTracingIncludes` entry in next.config.ts keeps the files
 * next to the function anyway, so a route that later turns dynamic
 * degrades to a slow first render rather than a crash.
 */
const FONT_DIR = path.join(process.cwd(), "src/app/_og/fonts");
const AVATAR_PATH = path.join(process.cwd(), "public/Faaiz.jpeg");

export async function loadFonts() {
    const [light, extraBold, mono] = await Promise.all([
        readFile(path.join(FONT_DIR, "BricolageGrotesque-Light.ttf")),
        readFile(path.join(FONT_DIR, "BricolageGrotesque-ExtraBold.ttf")),
        readFile(path.join(FONT_DIR, "GeistMono-Regular.ttf")),
    ]);

    return [
        { name: DISPLAY, data: light, weight: 300 as const, style: "normal" as const },
        { name: DISPLAY, data: extraBold, weight: 800 as const, style: "normal" as const },
        { name: MONO, data: mono, weight: 400 as const, style: "normal" as const },
    ];
}

export async function loadAvatar() {
    const avatar = await readFile(AVATAR_PATH);
    return `data:image/jpeg;base64,${avatar.toString("base64")}`;
}

/** The running head and the folio line, set the way the site sets them. */
const coord = {
    fontFamily: MONO,
    fontSize: 20,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
};

type CardProps = {
    /** Right-hand side of the running head — the department, or the place. */
    meta: string;
    /** The headline block. Each beat is a line; `turns` sets it at 800. */
    beats: { text: string; turns?: boolean }[];
    /** Display size for the beats. Long titles need a smaller setting. */
    beatSize: number;
    /** Optional standfirst under the headline. */
    standfirst?: string;
    /** Left-hand side of the folio line. */
    footer: string;
    /** Right-hand side of the folio line. Drawn with the ink mark beside it. */
    status: string;
    /** Optional portrait, kept in the center-safe area used by chat crops. */
    avatar?: string;
};

export function Card({ meta, beats, beatSize, standfirst, footer, status, avatar }: CardProps) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: PAPER,
                color: INK,
                padding: "56px 64px",
                fontFamily: DISPLAY,
            }}
        >
            {/* Running head. The site puts the department on the left and
                its meta right-aligned, both in mono, with the 2px rule
                underneath opening the section. */}
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    paddingBottom: 18,
                }}
            >
                <span style={{ ...coord, color: INK }}>Faaiz Muzzammil</span>
                <span style={{ ...coord, color: INK_3 }}>{meta}</span>
            </div>
            <div style={{ display: "flex", height: 2, background: INK }} />

            {/* The headline, optically centred in what is left. `flex: 1`
                on this block rather than a fixed offset, so a two-line
                project title and a three-beat cover both sit right. */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: avatar ? 42 : 0,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        width: avatar ? 500 : "100%",
                    }}
                >
                {/* `display: block`, not flex. A flex container lays its
                    text out as a single unbreakable item, so a line wider
                    than the measure runs straight off the right edge
                    instead of wrapping — which is exactly what happened
                    to "AI Assignment Solver", whose final r was sliced in
                    half by the card boundary. Block gives normal inline
                    layout, so an over-long title takes a second line and
                    the card stays intact whatever it is handed. */}
                    {beats.map((beat) => (
                        <div
                            key={beat.text}
                            style={{
                                display: "block",
                                fontSize: beatSize,
                                fontWeight: beat.turns ? 800 : 300,
                                letterSpacing: beatSize * -0.035,
                                lineHeight: 1.04,
                            }}
                        >
                            {beat.text}
                        </div>
                    ))}

                    {standfirst ? (
                        <div
                            style={{
                                display: "block",
                                marginTop: 24,
                                maxWidth: 860,
                                fontSize: 28,
                                fontWeight: 300,
                                lineHeight: 1.45,
                                color: INK_3,
                            }}
                        >
                            {standfirst}
                        </div>
                    ) : null}
                </div>

                {avatar ? (
                    /* ImageResponse accepts data URIs through a plain image
                       element; next/image cannot optimize this build-time asset. */
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={avatar}
                        alt=""
                        width={320}
                        height={320}
                        style={{
                            width: 320,
                            height: 320,
                            objectFit: "cover",
                            objectPosition: "50% 28%",
                            borderRadius: 9999,
                            border: `2px solid ${INK}`,
                        }}
                    />
                ) : null}
            </div>

            {/* Folio line. The hairline is the site's entry separator; the
                solid square stands in for the grain-filled "live" mark,
                which cannot flicker in a PNG. */}
            <div style={{ display: "flex", height: 1, background: HAIRLINE }} />
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 20,
                }}
            >
                <span style={{ ...coord, color: INK_3 }}>{footer}</span>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", width: 9, height: 9, background: INK }} />
                    <span style={{ ...coord, color: INK, marginLeft: 12 }}>{status}</span>
                </div>
            </div>
        </div>
    );
}
