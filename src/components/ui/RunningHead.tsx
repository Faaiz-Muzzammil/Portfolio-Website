import { cn } from "@/lib/cn";
import AnimatedText from "@/components/motion/AnimatedText";
import Reveal from "@/components/motion/Reveal";

type RunningHeadProps = {
    /** Where this department falls in the issue. Order carries meaning here. */
    number: string;
    /** The department's name, matching the nav exactly. */
    name: string;
    /**
     * A true fact about what is in this department — a count, a span of
     * years, a turnaround. The head carries data, never an ornament.
     */
    meta: string;
    title: string;
    /** The word the heading turns on. Set at the heavy end of the axis. */
    accentTitle?: string;
    id?: string;
    className?: string;
};

/**
 * The head of a department.
 *
 * Number and name in mono on the left, the fact on the right, then the title
 * on the same left edge as everything below it. One structure repeated in all
 * four departments, so a reader learns it once on Work and never has to read
 * it again.
 *
 * It draws no rule of its own. The section already opens on one that runs the
 * full width of the page, and a second rule 40px under it was two lines doing
 * one job.
 *
 * The title is set a full step above the entry titles beneath it. They were
 * both on `text-h2`, which left the department and the things inside it
 * shouting at the same volume — the one hierarchy error you cannot spend your
 * way out of with spacing.
 */
export default function RunningHead({
    number,
    name,
    meta,
    title,
    accentTitle,
    id,
    className,
}: RunningHeadProps) {
    return (
        /* One vertical scale runs the whole issue, and it is deliberately
           short: 12 / 20 / 32 / 56 / 80px. Head-to-content is always 56,
           block-to-block always 32, label-to-value always 12. Spacing chosen
           per component is what makes a page look assembled rather than
           designed, however carefully each individual gap was picked. */
        <header className={cn("mb-14", className)}>
            <Reveal y={0}>
                <div className="flex items-baseline justify-between gap-8">
                    <span className="coord text-coord text-ink">
                        {number} — {name}
                    </span>
                    <span className="coord text-coord text-right text-ink-3">{meta}</span>
                </div>
            </Reveal>

            {/* Light phrase, heavy last word — the cover's setting, at
                department size. The size gives the heading its rank over the
                entries beneath it; the weight is what makes it a sentence
                with a point rather than a label. */}
            <AnimatedText
                as="h2"
                id={id}
                className="display-axis mt-8 max-w-[14ch] text-h1 text-balance text-ink"
            >
                {title}
                {accentTitle && (
                    <>
                        {" "}
                        <strong>{accentTitle}</strong>
                    </>
                )}
            </AnimatedText>
        </header>
    );
}
