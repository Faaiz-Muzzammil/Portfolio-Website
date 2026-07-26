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

export interface Tool {
    name: string;
    /** Key into the ICONS map in components/ui/ToolIcon.tsx. */
    slug: string;
    category: string;
}

export interface NavItem {
    name: string;
    href: string;
    icon: "home" | "folder" | "briefcase" | "wrench" | "mail";
}
