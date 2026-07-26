import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Section from "@/components/layout/Section";
import SiteChrome from "@/components/layout/SiteChrome";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import PageFurniture from "@/components/layout/PageFurniture";
import Projects from "@/components/sections/Projects";
import Toolkit from "@/components/sections/Toolkit";
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

            <ScrollProgress />
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
