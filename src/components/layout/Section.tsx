import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/motion/Reveal";

type SectionProps = {
    id: string;
    labelledBy?: string;
    /** Opens the issue, so its top padding has to clear the fixed chrome. */
    first?: boolean;
    className?: string;
    children: ReactNode;
};

/**
 * A department of the issue.
 *
 * This used to render a frosted panel floating on a textured ground, inset
 * from the viewport on all four sides, each one at least a screen tall. That
 * is a stack of cards, and a magazine is not a stack of cards — it is ink on
 * paper with margins. So there is no panel here at all now: just the page
 * margin, the measure, and whatever rules the department draws for itself.
 *
 * Height comes from content, and only from content. Forcing every department
 * to a full viewport and centring it inside meant any department shorter than
 * the screen padded itself out with dead space at both ends — which is what
 * put a 450px void between the cover and the contents page.
 *
 * Separation is done with ink instead. Each department opens on a single rule
 * that runs the full width of the page — rail to rail, because `main` is inset
 * by exactly the rails' width — and closes on a folio. One rule, edge to edge,
 * reads as a division of the page; the two stacked rules this had before (a
 * section border and the running head's own) read as a mistake.
 */
export default function Section({
    id,
    labelledBy,
    first = false,
    className,
    children,
}: SectionProps) {
    return (
        <section
            id={id}
            aria-labelledby={labelledBy}
            className={cn(
                "relative scroll-mt-(--scroll-offset)",
                first ? "pt-(--scroll-offset)" : "pt-14 sm:pt-20",
                "pb-14 sm:pb-20",
                className,
            )}
        >
            {/* THE RULE IS RULED. It was a `border-t` on this element, which
                means it was simply there — the one place on the site where a
                rule appeared rather than being drawn, while `.rule-draw`
                under every link and the rails' own opening both stroke from
                one end. It is an element now so it can be given a
                `transform`, and `Reveal`'s `sweep` strokes it from the left
                edge of the page to the right as the department arrives.

                It stays a hairline of `--line-2` and it lands in exactly the
                position the border occupied, so nothing about the
                composition changed — only whether you see it happen.

                `y={0}`, because the rule must not also travel: a line that
                slides down while it draws is a line being placed, and this
                one is being ruled. The wrapper is absolutely positioned so
                it takes no part in the flow and the section's top padding is
                unchanged. */}
            {!first && (
                <Reveal sweep y={0} className="absolute inset-x-0 top-0">
                    <span aria-hidden data-sweep className="block h-px bg-line-2" />
                </Reveal>
            )}

            {/* The gutter is what keeps type off the rail rules. It has to be
                generous at `xl`, where those rules are the nearest thing to
                the first and last character of every line. */}
            <div className="mx-auto w-full max-w-site px-5 sm:px-8 xl:px-14">
                {children}
            </div>
        </section>
    );
}
