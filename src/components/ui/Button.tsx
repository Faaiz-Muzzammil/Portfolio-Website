import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* `solid` and `ghost` variants used to live here with no call sites. */
type Variant = "accent" | "outline";
type Size = "md" | "lg";

/* Square, like every other marker on the page. The hover fill sweeps up from
   the bottom edge rather than cross-fading, and it always arrives *darker* —
   never a different hue. Ember means "now"; a button under the cursor is not
   a live state, so it has no business borrowing that colour.
   `before:` holds the incoming colour; the label sits above it at z-10. */
const VARIANTS: Record<Variant, string> = {
    accent:
        "bg-accent text-accent-fg before:bg-ink hover:text-paper",
    outline:
        "border border-line-2 text-ink before:bg-ink hover:border-ink hover:text-paper",
};

const SIZES: Record<Size, string> = {
    md: "h-11 px-5 text-[0.875rem] gap-2",
    lg: "h-13 px-7 text-[0.9375rem] gap-2.5",
};

const BASE =
    "group/btn relative isolate inline-flex select-none items-center justify-center overflow-hidden " +
    "font-medium transition-colors duration-400 " +
    "before:absolute before:inset-0 before:-z-10 before:translate-y-full " +
    "before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] " +
    "hover:before:translate-y-0 " +
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 " +
    "motion-reduce:before:hidden motion-reduce:active:scale-100";

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

    const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

    const content = (
        <>
            {iconLeft}
            <span>{children}</span>
            {iconRight && (
                <span className="transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-1">
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
                <a
                    href={href}
                    className={classes}
                    {...(/^(https?:)?\/\//.test(href)
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    {...anchorRest}
                >
                    {content}
                </a>
            );
        }

        return (
            <Link href={href} className={classes} {...anchorRest}>
                {content}
            </Link>
        );
    }

    const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
        <button type={buttonRest.type ?? "button"} className={classes} {...buttonRest}>
            {content}
        </button>
    );
}
