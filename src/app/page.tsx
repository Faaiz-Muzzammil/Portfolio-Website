import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import SiteChrome from "@/components/layout/SiteChrome";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import PageFurniture from "@/components/layout/PageFurniture";
import Projects from "@/components/sections/Projects";
import Toolkit from "@/components/sections/Toolkit";
import PageTint from "@/components/layout/PageTint";
import { TintProvider } from "@/providers/TintProvider";
import { personalInfo, projects, socialLinks } from "@/data";

const SITE = "https://faaizmuzzammil.dev";

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            "@id": `${SITE}/#person`,
            name: personalInfo.name,
            jobTitle: personalInfo.role,
            email: `mailto:${personalInfo.email}`,
            url: SITE,
            image: `${SITE}/Faaiz.jpeg`,
            address: {
                "@type": "PostalAddress",
                addressLocality: "Islamabad",
                addressCountry: "PK",
            },
            sameAs: socialLinks.filter((l) => l.icon !== "mail").map((l) => l.url),
            knowsAbout: [
                "Full-stack development",
                "AI agents",
                "React",
                "Python",
                "Digital marketing",
            ],
        },
        {
            "@type": "WebSite",
            "@id": `${SITE}/#website`,
            url: SITE,
            name: `${personalInfo.name} — Portfolio`,
            publisher: { "@id": `${SITE}/#person` },
            hasPart: projects.map((p) => ({
                "@type": "CreativeWork",
                name: p.title,
                url: `${SITE}/projects/${p.slug}`,
            })),
        },
    ],
};

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* The colour, and everything that carries it. The provider works
                out one ink from the scroll position and hands it to all three
                readers — the two margins inside `PageFurniture` and the
                ground behind the measure — so they cannot disagree about what
                colour the page currently is. It has to wrap the sections
                because it measures them.

                It lives here rather than in the layout because the departments
                do: a project page has none of these ids, and a provider that
                cannot find its sections has nothing to interpolate between. */}
            {/* The hairline reading-progress bar that used to run along the
                top edge is gone. The margins now report the same thing better:
                the colour tells you which department you are in and the ruled
                scale in each rail tells you that you are moving through it,
                continuously and at the edges of vision rather than as a bar
                pinned over the top of the page. Two devices answering "where
                am I" is one too many, which is the same argument that removed
                the route rail this bar replaced. */}
            <TintProvider>
                <SiteChrome />
                <PageTint />
                <PageFurniture />

                {/* One issue: a cover, a contents page, four departments and a
                    colophon. Nothing is boxed and nothing floats — the sections
                    are bands of paper separated by their own margins, and each
                    one is as tall as its content needs, which is what stops the
                    page reading as five identical slides. */}
                <main className="page-inset relative z-10">
                    <Section id="home" labelledBy="home-title" first>
                        <Hero />
                    </Section>

                    <Section id="work" labelledBy="work-title">
                        <Projects />
                    </Section>

                    <Section id="experience" labelledBy="experience-title">
                        <Experience />
                    </Section>

                    <Section id="toolkit" labelledBy="toolkit-title">
                        <Toolkit />
                    </Section>

                    <Section id="contact" labelledBy="contact-title">
                        <Contact />
                    </Section>
                </main>

                <Footer />
            </TintProvider>
        </>
    );
}
