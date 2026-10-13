"use client";

import { useEffect } from "react";

import Button from "@/components/ui/Button";

/* A render error used to take the whole page down to Next's generic
   message. This keeps the visitor on a page that looks like the site,
   offers a retry, and leaves the detail in the console rather than on
   screen — `error.message` can carry internals, so it is never shown.
   The digest is safe to show: it is an opaque id that matches the server
   log line, which is what anyone reporting the problem needs. */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main id="main" className="relative z-10">
            <section className="glass mx-3 my-8 max-w-3xl px-5 py-12 sm:mx-auto sm:my-14 sm:px-10 sm:py-16">
                <p className="coord text-coord text-ink-3">Error</p>
                <h1 className="display-tight mt-5 text-h1 text-balance text-ink">
                    Something went wrong drawing this page.
                </h1>
                <p className="mt-5 max-w-[54ch] text-lead text-ink-2 text-pretty">
                    Trying again usually fixes it. If it doesn&apos;t, the front page is
                    a safe place to start over.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                    <Button variant="accent" onClick={reset}>
                        Try again
                    </Button>
                    <Button href="/">Front page</Button>
                </div>
                {error.digest && (
                    <p className="coord mt-8 text-coord text-ink-4">Ref {error.digest}</p>
                )}
            </section>
        </main>
    );
}
