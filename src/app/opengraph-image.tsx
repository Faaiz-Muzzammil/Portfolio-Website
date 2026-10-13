import { ImageResponse } from "next/og";

import { Card, SIZE, loadFonts } from "./_og/card";

/* `export const runtime = "edge"` used to sit here and has been removed.
   The card now reads its typefaces off disk, which the edge runtime has
   no filesystem for; and since this route is prerendered into a static
   PNG at build time, the runtime it would have requested never ran in
   production anyway. */

export const alt = "Faaiz Muzzammil — Engineers build. Marketers sell. I do both.";
export const size = SIZE;
export const contentType = "image/png";

/* The cover's three beats, verbatim. If Hero.tsx's BEATS change, change
   them here too — this is the version a stranger sees first, and a share
   card quoting a headline the page no longer carries is worse than one
   that quotes nothing. */
export default async function Image() {
    return new ImageResponse(
        (
            <Card
                meta="Islamabad, Pakistan"
                beats={[
                    { text: "Engineers Build." },
                    { text: "Marketers Sell." },
                    { text: "I Do Both.", turns: true },
                ]}
                beatSize={100}
                footer="Full-stack · AI agents · Growth"
                status="Open to work"
            />
        ),
        { ...SIZE, fonts: await loadFonts() },
    );
}
