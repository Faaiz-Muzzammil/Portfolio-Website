import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Faaiz Muzzammil — Full-stack Developer",
        short_name: "Faaiz",
        description:
            "Portfolio of Faaiz Muzzammil — full-stack developer and digital marketer.",
        start_url: "/",
        display: "standalone",
        background_color: "#FBF9F5",
        theme_color: "#FBF9F5",
        orientation: "portrait-primary",
        icons: [
            // TODO(faaiz): add square 192x192 and 512x512 PNGs at
            // /public/icon-192.png and /public/icon-512.png (one with
            // purpose "maskable") for a proper installable PWA.
            {
                src: "/Faaiz.jpeg",
                sizes: "any",
                type: "image/jpeg",
            },
        ],
    };
}
