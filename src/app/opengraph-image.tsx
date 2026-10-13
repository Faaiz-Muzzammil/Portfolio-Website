import { ImageResponse } from "next/og";

import { Card, SIZE, loadAvatar, loadFonts } from "./_og/card";

/* `export const runtime = "edge"` used to sit here and has been removed.
   The card now reads its typefaces off disk, which the edge runtime has
   no filesystem for; and since this route is prerendered into a static
   PNG at build time, the runtime it would have requested never ran in
   production anyway. */

export const alt = "Faaiz Muzzammil — I build useful apps. Then I help them grow.";
export const size = SIZE;
export const contentType = "image/png";

/* The cover's three beats, verbatim. If Hero.tsx's BEATS change, change
   them here too — this is the version a stranger sees first, and a share
   card quoting a headline the page no longer carries is worse than one
   that quotes nothing. */
export default async function Image() {
    const avatar = await loadAvatar();

    return new ImageResponse(
        (
            <Card
                meta="Islamabad, Pakistan"
                beats={[
                    { text: "I build useful apps." },
                    { text: "Then I help them grow.", turns: true },
                ]}
                beatSize={72}
                footer="Apps · AI agents · growth"
                status="Open to work"
                avatar={avatar}
            />
        ),
        { ...SIZE, fonts: await loadFonts() },
    );
}
