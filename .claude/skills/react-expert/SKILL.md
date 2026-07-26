---
name: React & Next.js Expert
description: High-level patterns and best practices for modern React codebases.
---

# React & Next.js Expert Best Practices

## Server Components (RSC)
- Fetch data in Server Components whenever possible.
- Keep Client Components (`"use client"`) as leaves in the component tree.
- Pass Server Components as `children` to Client Components to avoid de-optimizing.

## Performance
- Use `next/image` for all images.
- Implement `Suspense` boundaries for streaming UI.
- Use `dynamic()` imports for heavy components.

## State Management
- Prefer URL state (search params) for shareable state (filters, pagination).
- Use `useOptimistic` for immediate UI feedback during server actions.

## Styling (Tailwind)
- Use `clsx` and `tailwind-merge` for dynamic classes.
- Group widely used class combinations into `layer components` in CSS if reused >10 times.

## Accessibility
- Ensure all `img` tags have `alt` text.
- Use semantic HTML (`<main>`, `<article>`, `<nav>`).
- Ensure interactive elements are keyboard accessible.
