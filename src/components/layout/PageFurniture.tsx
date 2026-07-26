import { personalInfo } from "@/data";

/**
 * The furniture: everything printed on the page that is not the content.
 *
 * At `xl` and up the page is three columns: a rail, the content, a rail. The
 * rails are fixed strips of the viewport that the document cannot reach into
 * — everything that scrolls carries `.page-inset`, which reserves exactly
 * their width — so the rule down the inside edge of each one is a boundary
 * between two zones rather than a line drawn over the content.
 *
 * That is the fix for what this was before: the rules were positioned on the
 * measure's own edges, which put them directly under the first and last
 * character of every line.
 *
 *   RAILS     Given a surface of their own — a wash of ink on the light
 *             theme, a breath of light on the dark one, since nothing is
 *             darker than that theme's ground — bounded by a rule on the
 *             inside edge and carrying vertical marginalia in mono,
 *             reading bottom-to-top on the left as a book spine does and
 *             top-to-bottom on the right.
 *
 *             The tone is what makes the three columns read as three
 *             columns. With a hairline alone they were identical surfaces
 *             with a seam between them; with it, the middle third is the
 *             lit page and the outer two are the margins it sits on.
 *
 *   GLOW      Two soft masses bleeding in from the outer edges, so the rails
 *             have some weather in them behind the type.
 *
 * All of it is fixed, decorative and `aria-hidden` — every word here is
 * already in the document as real content. Below `xl` the rails collapse to
 * zero width and none of it renders.
 */
export default function PageFurniture() {
    return (
        <>
            <div className="edge-glow" aria-hidden />

            {/* Left rail, spine reading upward. */}
            <div
                aria-hidden
                className="rail pointer-events-none fixed inset-y-0 left-0 z-20 hidden w-(--rail-w) items-center justify-center border-r xl:flex"
            >
                <span className="coord rotate-180 text-coord whitespace-nowrap text-ink-3 [writing-mode:vertical-rl]">
                    {personalInfo.name} — {personalInfo.role}
                </span>
            </div>

            {/* Right rail, spine reading downward, ending on the one fact
                that is live rather than fixed. */}
            <div
                aria-hidden
                className="rail pointer-events-none fixed inset-y-0 right-0 z-20 hidden w-(--rail-w) items-center justify-center border-l xl:flex"
            >
                <span className="coord flex items-center gap-3 text-coord whitespace-nowrap text-ink-3 [writing-mode:vertical-rl]">
                    Portfolio 2025 — {personalInfo.location}, PK
                    <span className="live-mark size-1.5" />
                </span>
            </div>
        </>
    );
}
