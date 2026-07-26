import {
    SiClaude,
    SiCplusplus,
    SiCss,
    SiCursor,
    SiFigma,
    SiFirebase,
    SiGit,
    SiGithub,
    SiHtml5,
    SiJavascript,
    SiLangchain,
    SiMongodb,
    SiMysql,
    SiNetlify,
    SiNextdotjs,
    SiNodedotjs,
    SiOpenjdk,
    SiPostman,
    SiPython,
    SiReact,
    SiSelenium,
    SiSupabase,
    SiTailwindcss,
    SiTypescript,
    SiVercel,
} from "@icons-pack/react-simple-icons";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

/**
 * Brand marks via Simple Icons. Some marks have been withdrawn at the
 * trademark holders' request (Adobe, LinkedIn, OpenAI), so anything missing
 * falls through to a monogram rather than a broken import.
 */
const ICONS: Record<string, IconComponent> = {
    python: SiPython,
    cplusplus: SiCplusplus,
    java: SiOpenjdk,
    typescript: SiTypescript,
    javascript: SiJavascript,
    react: SiReact,
    nextjs: SiNextdotjs,
    nodejs: SiNodedotjs,
    html: SiHtml5,
    css: SiCss,
    tailwind: SiTailwindcss,
    mongodb: SiMongodb,
    mysql: SiMysql,
    supabase: SiSupabase,
    firebase: SiFirebase,
    langchain: SiLangchain,
    claude: SiClaude,
    cursor: SiCursor,
    figma: SiFigma,
    postman: SiPostman,
    selenium: SiSelenium,
    git: SiGit,
    github: SiGithub,
    vercel: SiVercel,
    netlify: SiNetlify,
};

type ToolIconProps = {
    slug: string;
    label: string;
    size?: number;
    className?: string;
};

export default function ToolIcon({
    slug,
    label,
    size = 20,
    className,
}: ToolIconProps) {
    const Icon = ICONS[slug];

    if (!Icon) {
        return (
            <span
                aria-hidden
                className={cn("coord grid place-items-center text-[0.5625rem]", className)}
                style={{ width: size, height: size }}
            >
                {label.slice(0, 2).toUpperCase()}
            </span>
        );
    }

    // Marks inherit the current text colour — a wall of saturated brand
    // logos would overwhelm a one-accent palette.
    return <Icon size={size} className={className} aria-hidden focusable="false" />;
}
