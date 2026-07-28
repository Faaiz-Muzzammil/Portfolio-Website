import RailWash from "@/components/layout/RailWash";

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
 *   RAILS     Given a surface of their own, bounded by a rule on the inside
 *             edge, and carrying the page's one colour: each department has
 *             a deep ink and both margins cross-fade between them as the page
 *             is scrolled, under the ordinary grey grain and never in it. A
 *             ruled scale travels down the outer edge of each — ink, not
 *             colour — which is the one thing out here you can see moving and
 *             therefore the only reason the colour reads as being on
 *             something. `RailWash` owns all of it; `sections.ts` owns the
 *             colours.
 *
 *   GLOW      Two soft masses bleeding in from the outer edges, so the rails
 *             have some weather in them. They drift, on two periods that
 *             never come back into phase.
 *
 * THERE IS NO TYPE IN THE MARGINS. Each rail used to carry vertical
 * marginalia in mono — the name and role down the left, the year and place
 * down the right, reading bottom-to-top and top-to-bottom as a book's spine
 * and its foot do. It is gone, and what removed it is what replaced it.
 *
 * Those labels were there to stop the outer thirds being empty, back when
 * empty was all they were. They now carry a colour that changes as the page
 * is read and a scale that moves while you read it, and two lines of 11px
 * mono sitting in the middle of that were the one thing in the composition
 * asking to be *read* — in a column the eye should never be doing any reading
 * in. Everything they said is in the document anyway: the name is in the
 * masthead and the title bar, the place and the year are in the colophon.
 *
 * All of it is fixed, decorative and `aria-hidden` — there is now nothing out
 * here that carries meaning a screen reader could want. Below `xl` the rails
 * collapse to zero width and none of it renders.
 *
 * ---- HOW THE PAGE OPENS -------------------------------------------------
 *
 * It does not start as three columns; it becomes them. Each rail's surface
 * wipes in from the outer edge of the screen and the rule draws down the
 * inside edge a beat behind it. The sequence is CSS and it shares the cover's
 * gate and the cover's curve, so the shell and the sentence are one arrival
 * rather than two things that happen to start together.
 *
 * The order is not decorative. A wipe from the outside in is the page being
 * laid onto the surface it is printed on; the rule arriving after the wash is
 * the boundary being drawn once there are two zones for it to divide. Reverse
 * it and you get a line that separates nothing, then a fill that makes it
 * retrospectively correct.
 */
export default function PageFurniture() {
    return (
        <>
            <div className="edge-glow" aria-hidden />

            <div
                aria-hidden
                className="rail rail-left pointer-events-none fixed inset-y-0 left-0 z-20 hidden w-(--rail-w) xl:block"
            >
                <RailWash />
            </div>

            <div
                aria-hidden
                className="rail rail-right pointer-events-none fixed inset-y-0 right-0 z-20 hidden w-(--rail-w) xl:block"
            >
                <RailWash />
            </div>
        </>
    );
}
