"use client";

import { m, useReducedMotion } from "framer-motion";
import {
    Briefcase,
    ChatCircle,
    FolderOpen,
    House,
    Moon,
    Sun,
    Wrench,
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
    wrench: Wrench,
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
            <div className="flex items-center gap-1 border border-line-2 bg-paper p-1 shadow-e2 max-sm:w-full">
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
                        className="absolute inset-y-0 left-0 bg-accent"
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
                                    "relative flex h-10 items-center justify-center gap-2 px-2.5 transition-colors duration-300 max-sm:min-w-0 max-sm:flex-1 sm:px-3.5",
                                    isActive
                                        ? "text-accent-fg"
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
                    className="grid h-10 w-9 place-items-center text-ink-3 transition-colors duration-300 hover:bg-surface-2 hover:text-ink sm:w-10"
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
                    className="group/cta relative flex h-10 items-center gap-2 overflow-hidden bg-ink px-3 text-paper sm:px-4"
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
