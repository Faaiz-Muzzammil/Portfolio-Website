"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PressAnchor, PressButton, PressLink } from "@/components/motion/Press";

/* `solid` and `ghost` variants used to live here with no call sites. */
type Variant = "accent" | "outline";
type Size = "md" | "lg";

/* Square, like every other marker on the page. The hover is the shared
   `.sweep` (globals.css): the fill rises from the bottom edge and the
   button *inverts* — never a different hue. The press is the shared
   spring (`Press.tsx`).

   THE ACCENT BUTTON SWEEPS TO PAPER, NOT INK. `--accent` resolves to the
   ink itself in both themes, so the old ink sweep painted ink over ink
   and the hover was invisible. Inverting is how this page already says
   "emphasis"; the border is the accent's own colour, so it is invisible
   at rest and holds the button's edge once the paper is in. */
const VARIANTS: Record<Variant, string> = {
    accent: "border border-accent bg-accent text-accent-fg [--sweep-fill:var(--paper)] [--sweep-fg:var(--ink)]",
    outline:
        "border border-line-2 text-ink [--sweep-fill:var(--ink)] [--sweep-fg:var(--paper)] hover:border-ink focus-visible:border-ink",
};

const SIZES: Record<Size, string> = {
    md: "h-11 px-5 text-[0.875rem] gap-2",
    lg: "h-13 px-7 text-[0.9375rem] gap-2.5",
};

const BASE =
    "sweep inline-flex select-none items-center justify-center font-medium " +
    "disabled:pointer-events-none disabled:opacity-50";

/** The classes a `Button` wears, for a control that needs its own
    markup (the contact form's send) but must look like the rest. */
export function buttonClasses(variant: Variant = "outline", size: Size = "md", className?: string) {
    return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type CommonProps = {
    variant?: Variant;
    size?: Size;
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    className?: string;
    children?: ReactNode;
};

type ButtonProps = CommonProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
        href?: undefined;
    };

type AnchorProps = CommonProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
        href: string;
        external?: boolean;
    };

export default function Button(props: ButtonProps | AnchorProps) {
    const {
        variant = "outline",
        size = "md",
        iconLeft,
        iconRight,
        className,
        children,
        ...rest
    } = props;

    const classes = buttonClasses(variant, size, className);

    const content = (
        <>
            {iconLeft}
            <span>{children}</span>
            {iconRight && (
                <span className="sweep-nudge">
                    {iconRight}
                </span>
            )}
        </>
    );

    if ("href" in props && props.href !== undefined) {
        const { href, external, ...anchorRest } = rest as AnchorProps;
        const isExternal =
            external ?? (/^(https?:)?\/\//.test(href) || href.startsWith("mailto:"));

        if (isExternal || href.endsWith(".pdf")) {
            return (
                <PressAnchor
                    href={href}
                    className={classes}
                    {...(/^(https?:)?\/\//.test(href)
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    {...(anchorRest as React.ComponentProps<typeof PressAnchor>)}
                >
                    {content}
                </PressAnchor>
            );
        }

        return (
            <PressLink
                href={href}
                className={classes}
                {...(anchorRest as Omit<React.ComponentProps<typeof PressLink>, "href">)}
            >
                {content}
            </PressLink>
        );
    }

    const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
        <PressButton
            type={buttonRest.type ?? "button"}
            className={classes}
            {...(buttonRest as React.ComponentProps<typeof PressButton>)}
        >
            {content}
        </PressButton>
    );
}
