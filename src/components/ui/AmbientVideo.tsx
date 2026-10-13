"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

type AmbientVideoProps = {
    src: string;
    poster: string;
    /** What the recording shows — the video is the only description a screen reader gets. */
    label: string;
    className?: string;
};

/**
 * A product demo, always running and never showing a control.
 *
 * Muted, looped and inline so every browser will autoplay it. It is paused
 * whenever it scrolls out of view — a 1080p decode running under the rest of
 * the page is frames taken off the scroll for nobody — and picked up again
 * when it comes back. Where iOS refuses autoplay (Low Power Mode, a data
 * saver) it is started on the reader's first touch instead, since a gesture
 * anywhere on the page is enough to unlock muted playback.
 *
 * THE FILE IS FETCHED ONE SCREEN AHEAD, NOT ON LOAD. With `src` and
 * `autoPlay` in the markup the whole file came down with the cover — most
 * of the first load, contending with the fonts and the portrait for a demo
 * three screens down. The poster holds the frame until the reader is a
 * viewport away; then `src` is set and the file has that screen of scroll
 * to arrive in.
 */
export default function AmbientVideo({ src, poster, label, className }: AmbientVideoProps) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        // React sets `muted` as a property after hydration rather than
        // rendering the attribute, and iOS checks for it before it will
        // autoplay — so it is set here, before the first play().
        video.muted = true;
        video.defaultMuted = true;

        const load = () => {
            if (video.getAttribute("src")) return;
            video.preload = "auto";
            video.src = src;
        };

        let visible = false;
        const play = () => {
            if (!visible) return;
            load();
            video.play().catch(() => {});
        };

        // A gesture unlocks playback where autoplay was refused. Passive and
        // listened for until the video is actually running.
        const unlock = () => {
            if (!visible) return;
            load();
            video.play().then(removeUnlock, () => {});
        };
        const events = ["touchstart", "touchend", "click", "scroll"] as const;
        const removeUnlock = () =>
            events.forEach((e) => window.removeEventListener(e, unlock));
        events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
        video.addEventListener("playing", removeUnlock, { once: true });

        const io = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                if (visible) play();
                else video.pause();
            },
            { threshold: 0.25 },
        );
        io.observe(video);

        const ahead = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                load();
                ahead.disconnect();
            },
            { rootMargin: "100% 0px" },
        );
        ahead.observe(video);

        return () => {
            io.disconnect();
            ahead.disconnect();
            removeUnlock();
        };
    }, [src]);

    return (
        <video
            ref={ref}
            poster={poster}
            muted
            loop
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            preload="none"
            tabIndex={-1}
            aria-label={label}
            className={cn("ambient-video pointer-events-none block h-auto w-full", className)}
        />
    );
}
