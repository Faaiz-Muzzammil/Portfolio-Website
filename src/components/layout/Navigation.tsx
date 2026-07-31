"use client";

import { m, useReducedMotion } from "framer-motion";
import {
    Briefcase,
    ChatCircle,
    FolderOpen,
    House,
    Moon,
    Sun,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { navItems } from "@/data";
import { cn } from "@/lib/cn";
import { springSnappy } from "@/lib/motion";

const ICONS = {
    home: House,
    folder: FolderOpen,
    briefcase: Briefcase,
    mail: ChatCircle,
} as const;

type NavigationProps = {
    activeId: string;
    onNavigate: (id: string) => void;
    /** The voice assistant needs the whole bar's width when it opens. */
    forceHidden?: boolean;
    className?: string;
};

/**
 * An instrument bar, not a pill of icons. Labels are spelled out from `sm`
 * up — an icon on its own is a guess, and the coordinate face is the whole
 * point of the chrome. Below that the icons carry it alone, because four
 * Martian Mono labels will not fit a 360px viewport.
 */
export default function Navigation({
    activeId,
    onNavigate,
    forceHidden = false,
    className,
}: NavigationProps) {
    const { setTheme, resolvedTheme } = useTheme();
    const reduce = useReducedMotion();

    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
    const [marker, setMarker] = useState({ x: 0, w: 0, ready: false });

    /* The active marker is measured by hand. `layoutId` is the obvious tool,
       but LazyMotion loads the `domAnimation` bundle, which has no layout
       animations — it would simply hard-cut. */
    const measure = useCallback(() => {
        const el = itemRefs.current.get(activeId);
        if (!listRef.current || !el) {
            setMarker((m) => ({ ...m, ready: false }));
            return;
        }
        setMarker({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
    }, [activeId]);

    useLayoutEffect(measure, [measure]);

    useEffect(() => {
        const list = listRef.current;
        if (!list || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(measure);
        ro.observe(list);
        return () => ro.disconnect();
    }, [measure]);

    const shown = !forceHidden;

    return (
        <m.nav
            aria-label="Sections"
            initial={false}
            animate={{ y: shown ? 0 : -90, opacity: shown ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : springSnappy}
            style={{ pointerEvents: shown ? "auto" : "none" }}
            className={cn("pointer-events-auto", className)}
        >
            {/* Solid paper with a hairline, not frosted glass. A magazine's
                running nav is printed on the page, not floated above it. */}
            {/* The bar takes the department's ink diluted into paper, so it
                shifts with the section the way the margins do — and on a
                phone, where the margins do not exist at all, it is the only
                thing carrying the colour.

                A wash and not the ink itself: the active marker inside this
                is the ink at full strength, and the two have to read as
                ground and figure. `--tint-wash` resolves to plain paper on
                the cover, which has no colour. Same 700ms as everything
                else that changes with the section.

                `tint-scope` IS NOT DECORATION — it is where the three tint
                tokens are declared, and it has to be this element because
                this is the smallest one containing everything that reads
                them. They were on `:root`, and an inherited custom property
                changing on the root re-resolves style for the whole
                document; `data-tint` changes at every section boundary, so
                that was a long frame in the middle of every scroll. Do not
                lift them back up. The full note is in `globals.css`. */}
            <div className="tint-scope flex items-center gap-1 border border-line-2 bg-(--tint-wash) p-1 shadow-e2 transition-colors duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] max-sm:w-full">
                {/* On a phone the bar spans the plate width, so the sections
                    spread to fill it rather than packing left and leaving a
                    hole in the middle. The marker measures real geometry, so
                    it follows without any change. */}
                <div
                    ref={listRef}
                    className="relative flex items-center max-sm:min-w-0 max-sm:flex-1"
                >
                    <m.span
                        aria-hidden
                        /* The marker takes the department's own ink, so the
                           bar agrees with the margins about where you are
                           instead of stating it a second way in black. It
                           eases over the same 700ms the margins use, and it
                           falls back to solid ink on the cover, which has no
                           colour — see the token pair in `globals.css`. */
                        className="absolute inset-y-0 left-0 bg-(--tint) transition-colors duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]"
                        initial={false}
                        animate={{
                            x: marker.x,
                            width: marker.w,
                            opacity: marker.ready ? 1 : 0,
                        }}
                        transition={reduce ? { duration: 0 } : springSnappy}
                    />

                    {navItems.map((item) => {
                        const id = item.href.replace("#", "");
                        const isActive = activeId === id;
                        const Icon = ICONS[item.icon];

                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                ref={(el) => {
                                    if (el) itemRefs.current.set(id, el);
                                    else itemRefs.current.delete(id);
                                }}
                                aria-current={isActive ? "true" : undefined}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(id);
                                }}
                                className={cn(
                                    /* Icon-only below `sm`, sharing the bar's
                                       width equally — four items, a divider, a
                                       theme toggle, a CTA and the mic all have
                                       to clear a 320px viewport. */
                                    /* `transition-[color,transform]`, not
                                       `transition-colors`: the press needs
                                       the transform tweened too, or the
                                       release snaps back instantly and the
                                       tap reads as a glitch rather than as
                                       a button coming back up. */
                                    "relative flex h-10 items-center justify-center gap-2 px-2.5 transition-[color,transform] duration-300 active:scale-[0.97] motion-reduce:active:scale-100 max-sm:min-w-0 max-sm:flex-1 sm:px-3.5",
                                    /* `--tint-fg`, not `--accent-fg`. The
                                       marker under this label is a light
                                       tint on every section but the cover,
                                       and paper-coloured type on a light
                                       tint is 2.2:1. The pair is declared
                                       together so the two can never
                                       disagree. */
                                    isActive
                                        ? "text-(--tint-fg)"
                                        : "text-ink-3 hover:text-ink",
                                )}
                            >
                                <Icon
                                    size={15}
                                    weight={isActive ? "fill" : "regular"}
                                    aria-hidden
                                    className="sm:hidden"
                                />
                                <span className="coord hidden text-coord sm:inline">
                                    {item.name}
                                </span>
                                <span className="sr-only sm:hidden">{item.name}</span>
                            </a>
                        );
                    })}
                </div>

                <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />

                {/* Icons swap in CSS via [data-theme], which next-themes sets in a
                    blocking pre-hydration script — so no `mounted` guard, and the
                    nav never pops in after hydration. */}
                <button
                    type="button"
                    onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
                    aria-label="Toggle colour theme"
                    className="grid h-10 w-9 place-items-center text-ink-3 transition-[color,background-color,transform] duration-300 hover:bg-surface-2 hover:text-ink active:scale-[0.97] motion-reduce:active:scale-100 sm:w-10"
                >
                    <Sun size={16} className="icon-when-light" aria-hidden />
                    <Moon size={16} className="icon-when-dark" aria-hidden />
                </button>

                <a
                    href="#contact"
                    onClick={(e) => {
                        e.preventDefault();
                        onNavigate("contact");
                    }}
                    className="group/cta relative flex h-10 items-center gap-2 overflow-hidden bg-ink px-3 text-paper transition-transform duration-300 active:scale-[0.97] motion-reduce:active:scale-100 sm:px-4"
                >
                    <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0 motion-reduce:hidden" />
                    <ChatCircle
                        size={14}
                        weight="fill"
                        aria-hidden
                        className="relative z-10 transition-colors duration-300 group-hover/cta:text-accent-fg"
                    />
                    {/* "Contact", not "Hire me" — it is the same destination the
                        rail and the footer call Contact, and a control keeps one
                        name everywhere it appears. */}
                    <span className="coord relative z-10 hidden text-coord transition-colors duration-300 group-hover/cta:text-accent-fg sm:inline">
                        Contact
                    </span>
                    <span className="sr-only sm:hidden">Contact</span>
                </a>
            </div>
        </m.nav>
    );
}
