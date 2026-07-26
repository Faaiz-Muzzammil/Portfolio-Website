"use client";

import { useEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "gsap";

type Options = {
    dependencies?: DependencyList;
    scope?: RefObject<Element | null>;
};

/**
 * Runs a GSAP setup function inside a `gsap.context()`, so every tween,
 * timeline and ScrollTrigger it creates is reverted together on cleanup.
 *
 * Same idea as @gsap/react's useGSAP, kept local to avoid a dependency for
 * ~20 lines. Return a function from `setup` for anything the context can't
 * revert itself — a SplitText instance, for example.
 *
 * Two shapes here are deliberate and should not be "tidied":
 *   1. `options` is not destructured in the signature. Combining a
 *      destructured-default parameter with `??` inside the body makes SWC
 *      emit an undeclared `_ref` temp — a real ReferenceError at runtime.
 *   2. `gsap.context(fn)` invokes `fn` synchronously, so the context handle
 *      is only ever touched from the cleanup closure.
 */
export function useGSAP(setup: () => void | (() => void), options?: Options) {
    const dependencies = options ? options.dependencies : undefined;
    const scope = options ? options.scope : undefined;

    useEffect(() => {
        let cleanup: void | (() => void);
        const scopeEl = scope && scope.current ? scope.current : undefined;

        const ctx = gsap.context(() => {
            cleanup = setup();
        }, scopeEl);

        return () => {
            if (cleanup) cleanup();
            ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies || []);
}
