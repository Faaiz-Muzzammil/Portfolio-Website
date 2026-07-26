"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

/**
 * Slim chrome for project detail pages. The full SiteChrome doesn't belong
 * here — there are no sections to track and no voice commands to route.
 */
export default function ProjectHeader() {
    const { setTheme, resolvedTheme } = useTheme();

    /* `backdrop-blur-lg`, not `2xl`. This header is sticky, so its backdrop
       filter is recomputed on every frame of every scroll for the whole
       length of a project page — 40px of blur was the most expensive thing
       on the route, and 16px is indistinguishable over grain. */
    return (
        <header className="sticky top-0 z-40 border-b border-line bg-(--glass-fill) backdrop-blur-lg">
            <div className="mx-auto flex h-14 w-full max-w-site items-center justify-between px-4 sm:px-10">
                <Link
                    href="/#work"
                    className="group/back coord inline-flex items-center gap-2 text-coord text-ink-2 transition-colors hover:text-ink"
                >
                    <ArrowLeft
                        size={13}
                        weight="bold"
                        aria-hidden
                        className="transition-transform duration-400 group-hover/back:-translate-x-1"
                    />
                    All work
                </Link>

                <button
                    type="button"
                    onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
                    aria-label="Toggle colour theme"
                    className="grid size-9 place-items-center text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                    <Sun size={16} className="icon-when-light" aria-hidden />
                    <Moon size={16} className="icon-when-dark" aria-hidden />
                </button>
            </div>
        </header>
    );
}
