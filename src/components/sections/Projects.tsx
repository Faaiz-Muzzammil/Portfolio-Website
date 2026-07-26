"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";

import { projects } from "@/data";
import { cn } from "@/lib/cn";
import RunningHead from "@/components/ui/RunningHead";
import Reveal from "@/components/motion/Reveal";

/**
 * The features, as a magazine index rather than a card grid.
 *
 * Each entry hangs its number in the margin, sets the title at feature size,
 * and runs its standfirst and stack in the reading column beside it. The
 * entries are ruled apart rather than boxed, which is how a printed index
 * separates one thing from the next without spending any ink on a container.
 *
 * Pointing at a row dims its siblings. That is the whole hover treatment: on
 * a page with no colour, taking contrast away from everything else is a
 * louder way to mark one thing than adding anything to it.
 */
export default function Projects() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div>
            <RunningHead
                id="work-title"
                number="01"
                name="Work"
                meta="2023 — 2025"
                title="Six things I actually"
                accentTitle="finished."
            />

            <Reveal>
                <ul onPointerLeave={() => setHovered(null)}>
                    {projects.map((project, index) => {
                        const isActive = hovered === index;
                        const dimmed = hovered !== null && !isActive;

                        return (
                            <li key={project.id} className="border-t border-line">
                                <Link
                                    href={`/projects/${project.slug}`}
                                    onPointerEnter={() => setHovered(index)}
                                    onFocus={() => setHovered(index)}
                                    onBlur={() => setHovered(null)}
                                    className={cn(
                                        "hang group/row relative block py-8 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:py-9",
                                        dimmed ? "opacity-30" : "opacity-100",
                                    )}
                                >
                                    <span className="hang-mark coord pt-2 text-coord text-ink-4">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    {/* No column gap below `sm`. A twelve-track
                                        grid has eleven gaps in it whether or
                                        not anything straddles them, and at
                                        2rem each that is 352px the grid cannot
                                        be narrower than — on a 360px phone the
                                        gutters alone are wider than the column
                                        the grid sits in, so every row pushed
                                        its own text off the right of the
                                        screen. Nothing here spans a partial
                                        column until `lg`, so below that the
                                        gap is buying nothing and costing the
                                        layout. */}
                                    <div className="grid grid-cols-12 gap-y-5 sm:gap-x-8">
                                        <div className="col-span-12 lg:col-span-6">
                                            <h3 className="display text-h2 leading-[1] text-ink">
                                                {project.title}
                                            </h3>

                                            <p className="mt-5 max-w-[48ch] text-body text-pretty text-ink-2">
                                                {project.description}
                                            </p>
                                        </div>

                                        {/* The entry's credits, starting at
                                            column eight so they read as the
                                            same entry rather than as a second
                                            one, and padded down to the title's
                                            own baseline so the two line up
                                            across the gutter. */}
                                        <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-3.5">
                                            <p className="coord flex items-center gap-3 text-coord text-ink-3">
                                                {project.year}
                                                <span aria-hidden className="size-0.5 bg-ink-4" />
                                                {project.category}
                                                <ArrowUpRight
                                                    size={15}
                                                    weight="bold"
                                                    aria-hidden
                                                    className="ml-auto text-ink-4 transition-[transform,color] duration-400 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-ink"
                                                />
                                            </p>

                                            <p className="coord mt-5 flex flex-wrap gap-x-2 gap-y-1.5 text-coord text-ink-4">
                                                {project.techStack.map((tech, i) => (
                                                    <span
                                                        key={tech}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {i > 0 && (
                                                            <span
                                                                aria-hidden
                                                                className="size-0.5 bg-ink-4"
                                                            />
                                                        )}
                                                        {tech}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Reveal>
        </div>
    );
}
