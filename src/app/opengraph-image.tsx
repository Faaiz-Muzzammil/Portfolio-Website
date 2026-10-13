import { ImageResponse } from "next/og";
import sharp from "sharp";

import { SIZE, Still, loadFonts, loadStill } from "./_og/card";

/* No `runtime = "edge"`: the card reads its typefaces and photograph off
   disk, and the route is prerendered into a static image at build time. */

export const alt = "Faaiz Muzzammil — I build useful apps. Then I help them grow.";
export const size = SIZE;

/* JPEG, not the PNG ImageResponse produces. This card is a photograph,
   and as a PNG it weighs about half a megabyte — past the point where
   WhatsApp quietly drops the preview image. Re-encoded it is a fraction
   of that and looks the same. */
export const contentType = "image/jpeg";

export default async function Image() {
    const png = await new ImageResponse(
        <Still src={await loadStill()} subtitle="I build useful apps. Then I help them grow." />,
        { ...SIZE, fonts: await loadFonts() },
    ).arrayBuffer();

    const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();

    return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": contentType } });
}
