import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import SiteChrome from "@/components/layout/SiteChrome";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import PageFurniture from "@/components/layout/PageFurniture";
import Projects from "@/components/sections/Projects";
import Toolkit from "@/components/sections/Toolkit";
import TintController from "@/components/layout/TintController";
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

            {/* The colour. `TintController` renders nothing — it puts the
                current department's name on the root element, and the
                stylesheet maps that to an ink which both margins read from
                one custom property.

                THE MARGINS ONLY. A matching wash used to sit over the full
                viewport so the ground behind the measure changed with them.
                It is gone: the colour belongs out at the edges of vision
                where it can report position without touching anything anyone
                is reading, and a tint over the measure was spending contrast
                on every line of body copy to say what the two rails were
                already saying.

                It sits here rather than in the layout because the departments
                do: a project page has none of these ids, so there is nothing
                out there for it to report on.

                The hairline reading-progress bar that used to run along the
                top edge is gone with it. The margins answer "where am I"
                better than a bar pinned over the page — which is the same
                argument that removed the route rail the bar replaced. */}
            <TintController />

            <SiteChrome />
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
        </>
    );
}
