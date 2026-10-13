import type { Metadata } from "next";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import Button from "@/components/ui/Button";
import ProjectHeader from "@/components/layout/ProjectHeader";

/* Without this file a mistyped URL fell through to Next's built-in 404:
   unstyled, off-theme, and with no way back but the address bar. This is
   the same frosted sheet a project page uses, saying one thing. */
export const metadata: Metadata = {
    title: "Page not found",
    robots: { index: false },
};

export default function NotFound() {
    return (
        <>
            <ProjectHeader />
            <main id="main" tabIndex={-1} className="focus:outline-none!">
                <section className="glass relative z-10 mx-3 my-8 max-w-3xl px-5 py-12 sm:mx-auto sm:my-14 sm:px-10 sm:py-16">
                    <p className="coord text-coord text-ink-3">404</p>
                    <h1 className="display-tight mt-5 text-h1 text-balance text-ink">
                        Nothing lives at this address.
                    </h1>
                    <p className="mt-5 max-w-[54ch] text-lead text-ink-2 text-pretty">
                        The link may be old, or the page may have moved. Everything that
                        exists is one click away from the front page.
                    </p>
                    <div className="mt-10">
                        <Button href="/" variant="accent" iconLeft={<ArrowLeft size={16} weight="bold" aria-hidden />}>
                            Back to the front page
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
