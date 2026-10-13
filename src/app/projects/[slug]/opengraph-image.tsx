import { ImageResponse } from "next/og";

import { projects } from "@/data";
import { SIZE, TitleCard, loadFonts } from "@/app/_og/card";

/* Without this file every project link unfurled as the site's cover, so
   six different URLs shared into a chat produced six identical previews —
   the one case where a preview is actively unhelpful, because it tells
   the reader nothing about which link they were sent. Each project gets
   its own title card, built from the same bars as the cover. */

export const size = SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
    return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);
    const fonts = await loadFonts();

    if (!project) {
        return new ImageResponse(
            <TitleCard title="Project" titleSize={120} left="Work" right="" />,
            { ...SIZE, fonts },
        );
    }

    /* Steps set against the 1040px measure in Bricolage ExtraBold, which
       averages a shade under 0.6em per character. `TitleCard` wraps, so
       a title longer than anything here takes a second line rather than
       being cut — the steps only decide what looks right. */
    const length = project.title.length;
    const titleSize = length <= 12 ? 132 : length <= 20 ? 100 : 80;

    return new ImageResponse(
        <TitleCard
            title={project.title}
            titleSize={titleSize}
            left={project.category}
            right={project.year}
        />,
        { ...SIZE, fonts },
    );
}
