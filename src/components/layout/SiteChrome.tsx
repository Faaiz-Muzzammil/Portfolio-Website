"use client";

import Navigation from "./Navigation";
import { useActiveSection } from "@/hooks/use-active-section";
import { SECTION_IDS, scrollToSection } from "@/lib/sections";

/**
 * The chrome stays put.
 *
 * It used to duck out of the way on the way down the page and slide back on
 * the way up, which meant the one control that answers "where am I and where
 * else can I go" was missing exactly while you were moving. It is pinned now,
 * at every scroll position.
 */
export default function SiteChrome() {
    const activeId = useActiveSection(SECTION_IDS);
    return (
        <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+var(--nav-top))] z-40 px-3 sm:px-4">
            {/* Below `sm` the row takes the same width and the same inset as
                the section plates, so the chrome and the content it sits
                over share one pair of margins. From `sm` up it goes back to
                being sized by its own content and centred. */}
            <div className="mx-auto flex w-full max-w-site items-center gap-2 sm:w-auto sm:justify-center sm:gap-2.5">
                <Navigation
                    activeId={activeId}
                    onNavigate={scrollToSection}
                    className="min-w-0 flex-1 sm:flex-none"
                />
            </div>
        </div>
    );
}
