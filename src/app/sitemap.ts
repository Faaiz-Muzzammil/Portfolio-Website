import type { MetadataRoute } from "next";
import { projects } from "@/data";

const BASE_URL = "https://faaizmuzzammil.dev";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    /* Hash fragments are not distinct URLs, so the previous entries
       (/#projects, /#tools, …) were duplicates of "/" as far as crawlers
       are concerned. The project pages, which are real URLs, were missing. */
    return [
        {
            url: BASE_URL,
            lastModified,
            changeFrequency: "monthly",
            priority: 1,
        },
        ...projects.map((project) => ({
            url: `${BASE_URL}/projects/${project.slug}`,
            lastModified,
            changeFrequency: "yearly" as const,
            priority: project.featured ? 0.8 : 0.6,
        })),
    ];
}
