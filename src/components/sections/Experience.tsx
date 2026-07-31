import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { experience } from "@/data";
import RunningHead from "@/components/ui/RunningHead";
import Reveal from "@/components/motion/Reveal";

/**
 * The route so far, set as a dated chronology.
 *
 * A real <ol> — these entries are in order and the order carries information,
 * so list semantics are honest here in a way they are not in most portfolios.
 *
 * The period hangs out in the left margin against the reading column, which is
 * how a printed timeline is set: the dates form their own column you can scan
 * without reading a word of the entries beside them. The vertical spine and
 * the waypoint dots are gone with it — the dates were already doing that job,
 * and drawing it twice is what made the old version look like a diagram.
 *
 * The role currently held is the only entry marked live, because it is the
 * only one that is still true.
 */
export default function Experience() {
    return (
        <div>
            <RunningHead
                id="experience-title"
                dept="experience"
                number="02"
                name="Experience"
                meta={`${experience.length} roles · dev, growth, legal`}
                title="Code, growth, and"
                accentTitle="paperwork."
            />

            <ol>
                {experience.map((job, index) => (
                    <Reveal
                        as="li"
                        key={job.id}
                        delay={index * 0.07}
                        className="border-t border-line py-8 sm:py-9"
                    >
                        {/* No column gap below `sm` — eleven 2rem gutters are
                            a 352px floor the grid cannot go under, which is
                            wider than a phone's whole column. See Projects. */}
                        <div className="grid grid-cols-12 gap-y-5 sm:gap-x-8">
                            {/* The dates column. Scannable on its own, but
                                kept to two columns — at three it sat a third
                                of the measure away from the entry it dates,
                                which is a void, not a margin. */}
                            <div className="col-span-12 sm:col-span-4 lg:col-span-2">
                                <p className="coord flex items-center gap-2.5 text-coord text-ink">
                                    {index === 0 && (
                                        <span aria-hidden className="live-mark size-2" />
                                    )}
                                    {job.period}
                                </p>
                                {job.location && (
                                    <p className="coord mt-2 text-coord text-ink-4">
                                        {job.location}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-12 sm:col-span-8 lg:col-span-9 lg:col-start-4">
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <h3 className="display text-h3 text-ink">{job.role}</h3>

                                    {job.companyUrl ? (
                                        <a
                                            href={job.companyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link inline-flex items-baseline gap-1 text-body"
                                        >
                                            <span className="rule-draw text-accent-ink">
                                                {job.company}
                                            </span>
                                            <ArrowUpRight
                                                size={12}
                                                weight="bold"
                                                aria-hidden
                                                className="self-center text-accent-ink transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                                            />
                                        </a>
                                    ) : (
                                        /* No URL means no link — a dead href is
                                           worse than plain text. */
                                        <span className="text-body text-ink-3">
                                            {job.company}
                                        </span>
                                    )}
                                </div>

                                <ul className="mt-5 space-y-2.5">
                                    {job.bullets.map((bullet) => (
                                        <li
                                            key={bullet}
                                            className="relative max-w-[68ch] pl-5 text-body text-pretty text-ink-2"
                                        >
                                            <span
                                                aria-hidden
                                                className="absolute top-[0.75em] left-0 h-px w-2.5 bg-line-2"
                                            />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </ol>
        </div>
    );
}
