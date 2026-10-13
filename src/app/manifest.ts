import type { MetadataRoute } from "next";

/* The install manifest, and the one place the site describes itself to an
   operating system rather than to a browser.

   TWO THINGS HERE WERE STALE. The background and theme colours were
   #FBF9F5, a warm off-white from the palette the site had before it was
   rebuilt monochrome — an installed window would have opened on a cream
   ground the site itself no longer uses anywhere. And the icon array
   pointed at /Faaiz.jpeg, a 176KB photograph at whatever aspect ratio it
   happens to be: Android would have letterboxed it onto a white tile and
   used it for the splash screen. The real icons are generated from the
   site's mark by scripts/generate-icons.mjs. */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Faaiz Muzzammil — Full-stack Developer & Marketer",
        short_name: "Faaiz",
        description:
            "Full-stack apps and AI agents out of Islamabad — then the growth work that gets them used.",
        start_url: "/",
        display: "standalone",
        /* Paper and ink. `background_color` is what Android paints behind
           the splash icon before the first frame renders, so it has to be
           the light theme's actual ground or the launch flashes. */
        background_color: "#FFFFFF",
        theme_color: "#FFFFFF",
        orientation: "portrait-primary",
        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            /* Drawn with a wider inset than the other two: a launcher is
               free to crop a maskable icon to a circle, a squircle or a
               rounded square, and only the middle 80% is guaranteed to
               survive it. */
            {
                src: "/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
