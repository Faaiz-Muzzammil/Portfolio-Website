export interface PersonalInfo {
    name: string;
    /** Short role label. Shown under the name in the hero and contact plates. */
    role: string;
    /** Two sentences max — the hero lead. */
    tagline: string;
    email: string;
    location: string;
    available: boolean;
}

export interface Stat {
    /** Numeric so the hero counter can animate up to it. */
    value: number;
    prefix?: string;
    suffix?: string;
    /** Names the thing measured, so the number reads on its own. */
    label: string;
}

export interface SocialLink {
    name: string;
    url: string;
    icon: "github" | "linkedin" | "mail";
}

export type ProjectStatus = "shipped" | "in-progress" | "archived";

export interface Project {
    id: number;
    title: string;
    slug: string;
    category: string;
    /** One card line. Keep under ~110 characters. */
    description: string;
    /** Two short paragraphs: what it does, then what was hard. */
    longDescription: string;
    role: string;
    /** "University project", "Personal", "Client work". */
    context: string;
    year: string;
    status: ProjectStatus;
    techStack: string[];
    features: string[];
    /** Optional — falls back to a monogram tile. */
    image?: string;
    /** Optional — the CTA is simply not rendered when absent. */
    link?: string;
    repoUrl?: string;
    featured: boolean;
}

export interface Experience {
    id: number;
    role: string;
    company: string;
    /** Omitted rather than "#" — a dead link is worse than no link. */
    companyUrl?: string;
    period: string;
    location?: string;
    /** Scannable bullets rather than one comma-spliced paragraph. */
    bullets: string[];
}

/* A `Tool` interface sat here, describing an entry in the toolkit
   department. Both it and the department are gone — see `data/index.ts`. */

export interface NavItem {
    name: string;
    href: string;
    /* `wrench` went with the toolkit. The union is the list of icons the
       bar can actually draw, so an id with no `ICONS` entry is a type
       error rather than a blank square at runtime. */
    icon: "home" | "folder" | "briefcase" | "mail";
}
