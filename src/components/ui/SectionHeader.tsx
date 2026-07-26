import { cn } from "@/lib/cn";
import AnimatedText from "@/components/motion/AnimatedText";
import Reveal from "@/components/motion/Reveal";

type SectionHeaderProps = {
    /** The section's name, set as the plate label. Matches the nav exactly. */
    eyebrow: string;
    /**
     * A true fact about what is in this section — a count, a span of years,
     * a turnaround time. The plate carries data, not an ornamental number,
     * and never a number the hero has already reported.
     */
    meta: string;
    title: string;
    /** The word the heading turns on. Set at the heavy end of the axis. */
    accentTitle?: string;
    id?: string;
    className?: string;
};

export default function SectionHeader({
    eyebrow,
    meta,
    title,
    accentTitle,
    id,
    className,
}: SectionHeaderProps) {
    return (
        <header className={cn("mb-14 sm:mb-18", className)}>
            <Reveal className="flex items-center gap-4" y={0}>
                <span className="coord text-coord whitespace-nowrap text-ink">
                    {eyebrow}
                </span>
                <span aria-hidden className="h-px flex-1 bg-line" />
                <span className="coord text-coord whitespace-nowrap text-ink-3">
                    {meta}
                </span>
            </Reveal>

            <AnimatedText
                as="h2"
                id={id}
                className="display-axis mt-7 max-w-[16ch] text-h2 text-balance text-ink"
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
