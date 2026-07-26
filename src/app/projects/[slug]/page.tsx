import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Check,
    GithubLogo,
} from "@phosphor-icons/react/dist/ssr";

import { personalInfo, projects } from "@/data";
import type { ProjectStatus } from "@/types";
import Button from "@/components/ui/Button";
import Footer from "@/components/layout/Footer";
import Pill from "@/components/ui/Pill";
import ProjectHeader from "@/components/layout/ProjectHeader";
import AnimatedText from "@/components/motion/AnimatedText";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";

const SITE = "https://faaizmuzzammil.dev";

/** Unknown slugs 404 at build time rather than attempting a dynamic render. */
export const dynamicParams = false;

export function generateStaticParams() {
    return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);
    if (!project) return { title: "Project not found" };

    return {
        title: project.title,
        description: project.description,
        alternates: { canonical: `/projects/${project.slug}` },
        openGraph: {
            title: `${project.title} — ${personalInfo.name}`,
            description: project.description,
            type: "article",
            url: `${SITE}/projects/${project.slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title: `${project.title} — ${personalInfo.name}`,
            description: project.description,
        },
    };
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
    shipped: "Shipped",
    "in-progress": "In progress",
    archived: "Archived",
};

export default async function ProjectDetail({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const index = projects.findIndex((p) => p.slug === slug);
    const project = projects[index];

    if (!project) notFound();

    const previous = index > 0 ? projects[index - 1] : null;
    const next = index < projects.length - 1 ? projects[index + 1] : null;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        url: `${SITE}/projects/${project.slug}`,
        dateCreated: project.year,
        genre: project.category,
        keywords: project.techStack.join(", "),
        author: { "@type": "Person", name: personalInfo.name, url: SITE },
    };

    const meta = [
        { label: "Role", value: project.role },
        { label: "Context", value: project.context },
        { label: "Year", value: project.year },
        { label: "Status", value: STATUS_LABEL[project.status] },
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ProjectHeader />

            {/* The same frosted panel the home page's sections use, so a
                project reads as one more sheet on the same ground. */}
            <article className="glass relative z-10 mx-3 my-8 max-w-3xl px-5 py-12 sm:mx-auto sm:my-14 sm:px-10 sm:py-16">
                {/* Category only. Year and status used to sit here as pills as
                    well, and both are already rows in the metadata grid a few
                    hundred pixels down. */}
                <Reveal className="flex flex-wrap items-center gap-2" y={12}>
                    <Pill tone="neutral">{project.category}</Pill>
                </Reveal>

                <AnimatedText
                    as="h1"
                    immediate
                    delay={0.15}
                    className="display-tight mt-7 text-h1 text-balance text-ink"
                >
                    {project.title}
                </AnimatedText>

                <AnimatedText
                    as="p"
                    split="words"
                    immediate
                    delay={0.45}
                    className="mt-5 max-w-[54ch] text-lead text-ink-2 text-pretty"
                >
                    {project.description}
                </AnimatedText>

                {/* Only rendered when a real URL exists — the previous build
                    always showed both buttons, pointing at "#" and github.com. */}
                {(project.link || project.repoUrl) && (
                    <Reveal className="mt-8 flex flex-wrap gap-3" delay={0.6} y={14}>
                        {project.link && (
                            <Magnetic>
                                <Button
                                    href={project.link}
                                    variant="accent"
                                    iconRight={<ArrowUpRight size={15} weight="bold" aria-hidden />}
                                >
                                    Live site
                                </Button>
                            </Magnetic>
                        )}
                        {project.repoUrl && (
                            <Magnetic>
                                <Button
                                    href={project.repoUrl}
                                    variant="outline"
                                    iconLeft={<GithubLogo size={16} aria-hidden />}
                                >
                                    Source
                                </Button>
                            </Magnetic>
                        )}
                    </Reveal>
                )}

                <Reveal
                    as="dl"
                    stagger={0.06}
                    className="mt-12 grid grid-cols-2 border-t border-line sm:grid-cols-4"
                >
                    {meta.map((item) => (
                        <div key={item.label} className="border-b border-line py-4 pr-4">
                            <dt className="coord text-coord text-ink-4">{item.label}</dt>
                            <dd className="mt-1.5 text-caption font-medium text-ink">
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </Reveal>

                <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-14">
                    <div>
                        <Reveal>
                            <h2 className="display text-h3 text-ink">Overview</h2>
                            <div className="mt-4 space-y-5">
                                {project.longDescription.split("\n\n").map((paragraph) => (
                                    <p
                                        key={paragraph.slice(0, 32)}
                                        className="max-w-[64ch] text-body text-ink-2 text-pretty"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </Reveal>

                        <Reveal className="mt-12">
                            <h2 className="display text-h3 text-ink">What it does</h2>
                            <ul className="mt-4 space-y-3">
                                {project.features.map((feature) => (
                                    <li key={feature} className="flex gap-3">
                                        <Check
                                            size={15}
                                            weight="bold"
                                            aria-hidden
                                            className="mt-1 flex-none text-ink-4"
                                        />
                                        <span className="text-body text-ink-2 text-pretty">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <Reveal>
                            <h2 className="coord text-coord text-ink-3">Built with</h2>
                            <ul className="mt-4 flex flex-wrap gap-1.5">
                                {project.techStack.map((tech) => (
                                    <li key={tech}>
                                        <Pill tone="neutral">
                                            {tech}
                                        </Pill>
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    </aside>
                </div>

                <nav
                    aria-label="Other projects"
                    className="mt-16 grid gap-px border-t border-line sm:grid-cols-2"
                >
                    {previous ? (
                        <Link
                            href={`/projects/${previous.slug}`}
                            className="group/nav border-b border-line py-6 transition-colors"
                        >
                            <span className="coord flex items-center gap-1.5 text-coord text-ink-4">
                                <ArrowLeft
                                    size={11}
                                    weight="bold"
                                    aria-hidden
                                    className="transition-transform duration-400 group-hover/nav:-translate-x-1"
                                />
                                Previous
                            </span>
                            <span className="rule-draw display mt-2 inline-block text-h3 text-ink">
                                {previous.title}
                            </span>
                        </Link>
                    ) : (
                        <span className="hidden sm:block" />
                    )}

                    {next && (
                        <Link
                            href={`/projects/${next.slug}`}
                            className="group/nav border-b border-line py-6 text-right transition-colors sm:col-start-2"
                        >
                            <span className="coord flex items-center justify-end gap-1.5 text-coord text-ink-4">
                                Next
                                <ArrowRight
                                    size={11}
                                    weight="bold"
                                    aria-hidden
                                    className="transition-transform duration-400 group-hover/nav:translate-x-1"
                                />
                            </span>
                            <span className="rule-draw display mt-2 inline-block text-h3 text-ink">
                                {next.title}
                            </span>
                        </Link>
                    )}
                </nav>

                <Reveal className="mt-16 text-center" scale>
                    <h2 className="display-axis mx-auto max-w-[18ch] text-h2 text-balance text-ink">
                        Want something like this <strong>built?</strong>
                    </h2>
                    <p className="mx-auto mt-4 max-w-[44ch] text-body text-ink-2 text-pretty">
                        Open to roles, internships and freelance work.
                    </p>
                    <div className="mt-7 flex justify-center">
                        <Magnetic>
                            <Button
                                href="/#contact"
                                variant="accent"
                                size="lg"
                                iconRight={<ArrowUpRight size={16} weight="bold" aria-hidden />}
                            >
                                Get in touch
                            </Button>
                        </Magnetic>
                    </div>
                </Reveal>
            </article>

            <Footer />
        </>
    );
}
