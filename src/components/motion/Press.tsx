"use client";

import Link from "next/link";
import { m, type HTMLMotionProps } from "framer-motion";
import type { ComponentProps } from "react";

import { press } from "@/lib/motion";

/* The one press on the site. Every control — filled button, icon
   button, nav link — goes down and comes back on the same spring, so
   a tap feels the same wherever it lands. Styling stays at the call
   site; this only adds the press.

   It replaces a spread of hand-tuned `active:scale-[…]` figures
   (0.92, 0.97, 0.98, 0.99), each on its own CSS duration. A CSS
   `:active` scale also snaps back the instant the finger lifts, and
   on a quick tap the browser often never paints the pressed frame at
   all; a spring always plays the whole round trip. */

const MLink = m.create(Link);

export function PressButton({ type = "button", ...props }: HTMLMotionProps<"button">) {
    return <m.button type={type} {...press} {...props} />;
}

export function PressAnchor(props: HTMLMotionProps<"a">) {
    return <m.a {...press} {...props} />;
}

export function PressLink(props: ComponentProps<typeof MLink>) {
    return <MLink {...press} {...props} />;
}
