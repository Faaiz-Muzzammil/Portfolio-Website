/**
 * The share card — what a link to this site unfurls into in WhatsApp,
 * iMessage, Slack, LinkedIn and X.
 *
 * ── THE IDEA ──────────────────────────────────────────────────────────
 *
 * A frame from a film. The cover is the mountain portrait inside cinema
 * letterbox bars (2.39:1), with one line of speech set as a subtitle and
 * the name sitting in the bar the way a credit would. Project pages get
 * the same bars around a black frame with the title centred — the title
 * card that comes before the scene.
 *
 *     ███████████████████████████████████████████████    ← bar, 64px
 *     ┌─────────────────────────────────────────────┐
 *     │                 photograph                  │    ← 1200 × 502
 *     │        I build useful apps. Then I …        │    ← subtitle
 *     └─────────────────────────────────────────────┘
 *     █ FAAIZ MUZZAMMIL ███████████████████████ PK █    ← bar, 64px
 *
 * Almost no words. Every platform prints the page title and description
 * directly under the image, so a card that repeats them is spending its
 * pixels on a sentence the reader is about to see twice. The picture's
 * job is to be recognisably a person, and recognisably this one.
 *
 * No badges, no status marks, no rules. The previous cards carried a
 * running head, a folio line and an "open to work" marker; all three
 * were furniture standing in for content.
 *
 * ── WHY IT DOES NOT MOVE ──────────────────────────────────────────────
 *
 * An animated GIF can sit behind og:image, but X, LinkedIn, WhatsApp and
 * iMessage draw it static and Discord shows its first frame. Animation
 * here would be work only a handful of Slack users ever saw, paid for
 * with a dithered photograph everywhere else.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

export const SIZE = { width: 1200, height: 630 };

/* 1200 / 2.39 ≈ 502, which leaves 64px for each bar. */
const BAR = 64;

const BLACK = "#000000";
const FRAME = "#0E0E0E";
const WHITE = "#FFFFFF";
const DIM = "#8A8A8A";

const DISPLAY = "Bricolage Grotesque";
const MONO = "Geist Mono";

/**
 * Satori does not interpolate a variable axis — it renders whatever
 * instance it is handed — so these are the static `opsz 96` cuts at
 * 300 and 800.
 *
 * They are read off disk rather than fetched. Every route that draws a
 * card is prerendered, so this runs at build time where the repository
 * is present; `outputFileTracingIncludes` in next.config.ts keeps the
 * files beside the function in case a route later turns dynamic.
 */
const FONT_DIR = path.join(process.cwd(), "src/app/_og/fonts");
const STILL_PATH = path.join(process.cwd(), "public/portrait.jpeg");

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

export async function loadStill() {
    const still = await readFile(STILL_PATH);
    return `data:image/jpeg;base64,${still.toString("base64")}`;
}

const credit = {
    fontFamily: MONO,
    fontSize: 17,
    letterSpacing: 3,
    textTransform: "uppercase" as const,
};

/** A letterbox bar. Text in it sits on the bar's centre line. */
function Bar({ left, right }: { left?: string; right?: string }) {
    return (
        <div
            style={{
                height: BAR,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 40px",
                background: BLACK,
            }}
        >
            <span style={{ ...credit, color: WHITE }}>{left ?? ""}</span>
            <span style={{ ...credit, color: DIM }}>{right ?? ""}</span>
        </div>
    );
}

type StillProps = {
    /** The photograph, as a data URI. */
    src: string;
    /** One line of speech, set as a subtitle over the bottom of the frame. */
    subtitle: string;
};

/** The cover: a still from the film. */
export function Still({ src, subtitle }: StillProps) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: BLACK,
                fontFamily: DISPLAY,
            }}
        >
            <Bar />
            <div
                style={{
                    position: "relative",
                    height: SIZE.height - BAR * 2,
                    display: "flex",
                }}
            >
                {/* ImageResponse takes a data URI through a plain image
                    element; next/image has nothing to optimise here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt=""
                    width={SIZE.width}
                    height={SIZE.height - BAR * 2}
                    style={{
                        width: SIZE.width,
                        height: SIZE.height - BAR * 2,
                        objectFit: "cover",
                        /* Head in the upper third, mountains behind it,
                           cut just above the hands. */
                        objectPosition: "50% 27%",
                    }}
                />
                {/* Subtitles sit low and centred, over the dark of the
                    shirt, which is what makes white legible on a
                    photograph whose sides are blown-out riverbed. */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 30,
                        display: "flex",
                        justifyContent: "center",
                        color: WHITE,
                        fontSize: 30,
                        fontWeight: 300,
                        letterSpacing: -0.3,
                        textShadow: "0 1px 10px rgba(0, 0, 0, 0.85)",
                    }}
                >
                    {subtitle}
                </div>
            </div>
            <Bar left="Faaiz Muzzammil" right="Islamabad" />
        </div>
    );
}

type TitleCardProps = {
    title: string;
    /** Display size for the title. Long titles need a smaller setting. */
    titleSize: number;
    /** Left of the lower bar. */
    left: string;
    /** Right of the lower bar. */
    right: string;
};

/** A project page: the title card before the scene. */
export function TitleCard({ title, titleSize, left, right }: TitleCardProps) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: BLACK,
                fontFamily: DISPLAY,
            }}
        >
            <Bar left="Faaiz Muzzammil" />
            <div
                style={{
                    height: SIZE.height - BAR * 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 80px",
                    background: FRAME,
                }}
            >
                {/* `display: block` so an over-long title wraps instead of
                    running off the edge as one unbreakable flex item. */}
                <div
                    style={{
                        display: "block",
                        color: WHITE,
                        fontSize: titleSize,
                        fontWeight: 800,
                        letterSpacing: titleSize * -0.035,
                        lineHeight: 1.02,
                        textAlign: "center",
                    }}
                >
                    {title}
                </div>
            </div>
            <Bar left={left} right={right} />
        </div>
    );
}
