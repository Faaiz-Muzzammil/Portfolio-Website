"use client";

import { ArrowUp, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

import { personalInfo, socialLinks } from "@/data";
import { scrollToTop } from "@/lib/sections";

const SOCIAL_ICONS = {
    github: GithubLogo,
    linkedin: LinkedinLogo,
} as const;

/**
 * The end of the route, and deliberately small.
 *
 * What was here before repeated most of the page: a full copy of the section
 * nav that the top bar and the route rail already provide, an email link
 * sitting directly beneath the contact form's own email link, and the name
 * and city printed twice within eighty pixels of each other. A footer earns
 * its place by holding what has nowhere else to go — the external profiles,
 * the way back up, and the copyright — so that is all it holds.
 */
export default function Footer() {
    const year = new Date().getFullYear();

    /* Email is filtered out: the contact section immediately above is an
       entire panel devoted to getting in touch. */
    const profiles = socialLinks.filter((link) => link.icon !== "mail");

    /* The safe-area inset keeps the colophon clear of the home indicator on an
       iPhone, where the last 34px of the viewport are not really yours to
       paint on. */
    return (
        <footer className="page-inset relative z-10">
            {/* The footer is separated from the page exactly as the departments
                are separated from each other: the same `border-line-2` rule at
                the same width — rail to rail, outside the gutter. It had a
                heavier, narrower rule of its own, which made the last division
                on the page the one division that did not match the others. A
                running rule that changes at the foot is not a system, it is an
                exception.

                The rule is shared; the space above it is not. A department
                opens on `pt-20` because it has a heading and a screen of
                content to introduce. This has one line of type and three
                40px buttons, and giving it the same runway left a 200px void
                with a copyright notice floating in the middle of it. The
                padding is set to the content instead — equal above and below,
                a little over the height of the row itself, which is what
                makes a strip read as closed rather than as abandoned. */}
            <div className="border-t border-line-2 pt-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:pt-10 sm:pb-10">
                <div className="mx-auto w-full max-w-site px-5 sm:px-8 xl:px-14">
                    {/* Centred on a phone, split to the two edges from `sm`.
                        Stacked and ranged left, the colophon line and the
                        icon strip were two objects hugging the same margin
                        with the width of the screen empty beside them — the
                        line has nothing to its right and the icons have
                        nothing to theirs, so neither reads as placed. On one
                        row that emptiness is the space between them and it is
                        doing a job; stacked, it is just a gap. Centring gives
                        the pair an axis to share instead. */}
                    <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
                        <p className="coord text-coord text-ink-3">
                            © {year} {personalInfo.name} · {personalInfo.location}
                        </p>

                        <div className="flex items-center gap-px">
                            {profiles.map((link) => {
                                const Icon =
                                    SOCIAL_ICONS[link.icon as keyof typeof SOCIAL_ICONS];
                                return (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        aria-label={link.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="grid size-10 place-items-center text-ink-3 shadow-[0_0_0_1px_var(--line)] transition-colors duration-300 hover:bg-ink hover:text-paper"
                                    >
                                        <Icon size={16} aria-hidden />
                                    </a>
                                );
                            })}

                            <button
                                type="button"
                                onClick={scrollToTop}
                                aria-label="Back to top"
                                className="group/top grid size-10 place-items-center text-ink-3 shadow-[0_0_0_1px_var(--line)] transition-colors duration-300 hover:bg-ink hover:text-paper"
                            >
                                <ArrowUp
                                    size={16}
                                    aria-hidden
                                    className="transition-transform duration-400 group-hover/top:-translate-y-0.5"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
