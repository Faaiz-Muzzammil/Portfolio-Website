import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Two tones and one size, because two tones and one size are what the site
   uses. The variants that were here for `accent`, `signal`, a leading dot and
   a non-mono mode had no call sites — options nobody picks are just guesses
   with a maintenance cost. */
const TONES = {
    neutral: "border-line bg-surface-2 text-ink-2",
    outline: "border-line text-ink-3",
} as const;

type PillProps = {
    tone?: keyof typeof TONES;
    className?: string;
    children: ReactNode;
};

export default function Pill({ tone = "neutral", className, children }: PillProps) {
    return (
        <span
            className={cn(
                "coord inline-flex h-7 select-none items-center border px-3 text-coord whitespace-nowrap",
                TONES[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
