"use client";

import { ArrowUpRight, Crosshair, HandGrabbing, HandPalm, HandPointing } from "@phosphor-icons/react/dist/ssr";

import Reveal from "@/components/motion/Reveal";
import { PressAnchor } from "@/components/motion/Press";
import AmbientVideo from "@/components/ui/AmbientVideo";

const SITE_URL = "https://tryoverride.vercel.app";

/* The game's whole control scheme, as its own menu prints it, with the
   detail of what the tracker is actually looking for in each. */
const GESTURES = [
    { Icon: HandPointing, title: "Move to aim", detail: "Index fingertip steers the crosshair" },
    { Icon: HandGrabbing, title: "Pinch to shoot", detail: "Thumb to index, middle or ring" },
    { Icon: HandPalm, title: "Open to reload", detail: "Flat palm, upright, to the camera" },
];

/**
 * Override, bound in above the capstone as a second insert.
 *
 * Same build as `Marketeer` — a sheet of the product's own stock with the
 * issue's devices kept inside it — but on the game's colours: its black
 * and the one gold its menus are drawn in. The footnote row under the
 * plate is the control scheme rather than awards, because the thing a
 * reader needs to know about a game played with your hands is which
 * hand shapes it reads. `globals.css` has the notes on the colour.
 */
export default function Override() {
    return (
        <article aria-labelledby="override-title" className="override mt-20 sm:mt-28">
            <div className="px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <Reveal className="grid grid-cols-12 gap-y-8 lg:gap-x-10">
                    <div className="col-span-12 lg:col-span-7">
                        <p className="coord flex items-center gap-2 text-coord text-(--ov-accent)">
                            <Crosshair size={12} weight="bold" aria-hidden />
                            Computer vision
                            <span aria-hidden className="size-0.5 bg-current opacity-60" />
                            2026
                        </p>

                        <h3
                            id="override-title"
                            className="display-axis mt-6 max-w-[16ch] text-h2 text-balance"
                        >
                            Override is a shooter you play with{" "}
                            <strong className="ov-underline whitespace-nowrap">your bare hands.</strong>
                        </h3>
                    </div>

                    <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:self-end">
                        <p className="max-w-[44ch] text-body text-pretty text-(--ov-ink-2)">
                            A first-person shooter in the browser, aimed and fired through your
                            webcam. Built with Shahum: I trained the gestures and wrote the game
                            logic and backend; Shahum designed the game and its sound and
                            brought the model into it.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                            <PressAnchor
                                href={SITE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ov-button sweep inline-flex h-10 items-center gap-2 px-4 text-[0.8125rem] font-medium"
                            >
                                Play Override
                                <span className="sweep-nudge [--nudge-x:2px] [--nudge-y:-2px]">
                                    <ArrowUpRight size={14} weight="bold" aria-hidden />
                                </span>
                            </PressAnchor>

                            <span className="coord text-coord text-(--ov-ink-3)">
                                Desktop and webcam
                            </span>
                        </div>
                    </div>
                </Reveal>

                {/* The gameplay across the full measure, at the recording's
                    own proportion rather than forced to 16:9 — the HUD sits
                    in its corners and a crop takes it off. */}
                <Reveal scale className="mt-10 sm:mt-14">
                    <div className="overflow-hidden bg-(--ov-tile) shadow-[0_0_0_1px_var(--ov-line-2)]">
                        <AmbientVideo
                            src="/override/demo.mp4"
                            poster="/override/demo-poster.webp"
                            label="Override gameplay: the start menu, then enemies in a night city shot down with hand gestures"
                            className="aspect-[1280/741]"
                        />
                    </div>
                </Reveal>

                <Reveal
                    as="ul"
                    stagger={0.08}
                    className="mt-10 grid gap-x-10 sm:mt-12 md:grid-cols-3"
                >
                    {GESTURES.map(({ Icon, title, detail }) => (
                        <li
                            key={title}
                            className="flex items-center gap-3.5 border-t border-(--ov-line) py-5"
                        >
                            <span className="ov-key grid size-10 shrink-0 place-items-center rounded-full">
                                <Icon size={18} weight="fill" aria-hidden />
                            </span>
                            <span className="min-w-0 pt-0.5">
                                <span className="block text-caption leading-snug font-medium text-(--ov-ink)">
                                    {title}
                                </span>
                                <span className="coord mt-1.5 block text-coord text-(--ov-ink-3)">
                                    {detail}
                                </span>
                            </span>
                        </li>
                    ))}
                </Reveal>
            </div>
        </article>
    );
}
