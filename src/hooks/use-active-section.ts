"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in view.
 *
 * One IntersectionObserver, no scroll handler for the common case. The band
 * (`-40%` top, `-55%` bottom) is a horizontal strip across the middle of the
 * viewport; whichever observed section sits highest inside it wins.
 */
export function useActiveSection(ids: readonly string[]) {
    const [active, setActive] = useState<string>(ids[0]);

    useEffect(() => {
        const els = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (els.length === 0) return;

        const visible = new Map<string, number>();

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        visible.set(entry.target.id, entry.boundingClientRect.top);
                    } else {
                        visible.delete(entry.target.id);
                    }
                }

                if (visible.size > 0) {
                    const sorted = [...visible.entries()].sort((a, b) => a[1] - b[1]);
                    setActive(sorted[0][0]);
                }
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
        );

        els.forEach((el) => observer.observe(el));

        /* The last section is often shorter than the band, so it can never
           satisfy the observer. Without this, "Contact" never lights up.

           The document height is measured once and kept, rather than read
           inside the handler. `scrollHeight` is a layout-flushing property:
           asking for it forces the browser to resolve every pending style and
           layout change before it can answer, and doing that on every scroll
           event turns a passive listener into a synchronous reflow sixty
           times a second — on the main thread, while the page is moving,
           which is exactly where jank comes from.

           A ResizeObserver on the body refreshes it instead. Its callback
           runs after layout has already been computed, so the read is free,
           and it catches every real cause of the page changing height: a
           reveal firing, a font swapping, the viewport rotating. `scrollY`
           and `innerHeight` are plain properties and cost nothing. */
        let docHeight = document.documentElement.scrollHeight;

        const onScroll = () => {
            if (window.innerHeight + window.scrollY >= docHeight - 4) {
                setActive(ids[ids.length - 1]);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            docHeight = document.documentElement.scrollHeight;
            onScroll();
        });

        resizeObserver.observe(document.body);

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => {
            observer.disconnect();
            resizeObserver.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    }, [ids]);

    return active;
}
