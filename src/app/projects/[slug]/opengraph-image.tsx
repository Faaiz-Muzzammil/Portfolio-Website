import { ImageResponse } from "next/og";

import { projects } from "@/data";
import { Card, SIZE, loadFonts } from "@/app/_og/card";

/* Without this file every project link unfurled as the site's cover, so
   six different URLs shared into a chat produced six identical previews
   reading "Engineers Build." — the one case where a preview is actively
   unhelpful, because it tells the reader nothing about which link they
   were sent. Each project now gets its own card, built from the same
   shell so the set still reads as one system. */

export const size = SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
    return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
        return new ImageResponse(
            (
                <Card
                    meta="Work"
                    beats={[{ text: "Project", turns: true }]}
                    beatSize={96}
                    footer="Faaizmuzzammil.dev"
                    status="Open to work"
                />
            ),
            { ...SIZE, fonts: await loadFonts() },
        );
    }

    /* The title is set at 800 — it is the turn, in the cover's terms —
       and the description carries it as a standfirst at 300.

       The size steps down with length so a long title stays on one line.
       These three steps are set against the widest the measure gets
       (1072px) in Bricolage ExtraBold, which averages a shade under
       0.6em per character: twenty characters at 82px comes to roughly
       960px and clears the margin. A single `length > 22 ? 76 : 92`
       test sat here and put "AI Assignment Solver" — twenty characters,
       so it took the 92 — about fifteen pixels past the right edge.

       The steps are the thing that makes titles *look* right, not the
       thing that keeps them inside the card; `Card` wraps now, so a
       title longer than anything here takes a second line rather than
       being cut. */
    const titleLength = project.title.length;
    const beatSize = titleLength <= 12 ? 96 : titleLength <= 20 ? 82 : 68;

    /* Four entries is what the folio line holds at 20px mono before it
       collides with the status mark on the right. */
    const stack = project.techStack.slice(0, 4).join(" · ");

    return new ImageResponse(
        (
            <Card
                meta={project.category}
                beats={[{ text: project.title, turns: true }]}
                beatSize={beatSize}
                standfirst={project.description}
                footer={stack}
                status={project.year}
            />
        ),
        { ...SIZE, fonts: await loadFonts() },
    );
}
