import { cn } from "@/lib/cn";
import type { SectionId } from "@/lib/sections";
import AnimatedText from "@/components/motion/AnimatedText";
import Reveal from "@/components/motion/Reveal";

type RunningHeadProps = {
    /**
     * Which department this is, as a section id — the ink the heading's
     * heavy word is set in. It is a separate prop from `name` on purpose:
     * `name` is display text and may be reworded, and a colour that moved
     * because a label was retitled would be a very quiet bug.
     */
    dept: SectionId;
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
    dept,
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
                with a point rather than a label.

                AND THE HEAVY WORD NOW CARRIES THE DEPARTMENT'S COLOUR. This
                is the one place in the measure that does. The margins say
                which department you are in by turning a colour and the page
                said it nowhere else, so the colour was information the
                content had no access to — you had to look away from what you
                were reading to find out where you were. Putting it on the
                word the heading already turns on costs the composition
                nothing: there was a single point of emphasis in this heading
                before and there is a single point of emphasis in it now.

                IT IS STILL THE WEIGHT DOING THE WORK. The step from 300 to
                800 is what makes the emphasis, and it survives on its own —
                the colour is a second channel on the same word, not a
                substitute for the first. Turn the colour off, as the cover
                does, and the heading still reads exactly as designed.

                IT IS THIS DEPARTMENT'S INK, NOT THE ACTIVE ONE, AND IT DOES
                NOT TRANSITION. `dept` names the colour and `.tint-word`
                paints it, once. The word does not read `[data-tint]` off the
                root, because a heading does not change department — every
                version that tied it to the active section had this word come
                up the screen in the previous department's colour and then
                correct itself while being read. The reveal `AnimatedText`
                already runs is the arrival; there is nothing left to animate.
                `globals.css` has the full argument. */}
            <AnimatedText
                as="h2"
                id={id}
                className="display-axis mt-8 max-w-[14ch] text-h1 text-balance text-ink"
            >
                {title}
                {accentTitle && (
                    <>
                        {" "}
                        <strong className="tint-word" data-dept={dept}>
                            {accentTitle}
                        </strong>
                    </>
                )}
            </AnimatedText>
        </header>
    );
}
