import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

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
                first
                    ? "pt-(--scroll-offset)"
                    : "border-t border-line-2 pt-14 sm:pt-20",
                "pb-14 sm:pb-20",
                className,
            )}
        >
            {/* The gutter is what keeps type off the rail rules. It has to be
                generous at `xl`, where those rules are the nearest thing to
                the first and last character of every line. */}
            <div className="mx-auto w-full max-w-site px-5 sm:px-8 xl:px-14">
                {children}
            </div>
        </section>
    );
}
