---
name: Design System & UX Expert
description: Expert principles for creating premium, aesthetic, and accessible user interfaces.
---

# Design System & UX Expert

This skill defines the standards for creating "wow" factor web experiences.

## Core Aesthetic Principles
- **Visual Hierarchy**: Use spacing (whitespace) and typography scale to guide the eye. Do not rely solely on color.
- **Micro-Interactions**: Every button click, hover, and page transition should have a subtle animation (framer-motion).
- **Glassmorphism & Depth**: Use layered blurs (`backdrop-filter`) and subtle borders (`border-white/10`) to create depth in dark mode.

## Color Theory
- **60-30-10 Rule**: 60% Neutral (Background), 30% Secondary (Cards/Surfaces), 10% Accent (Buttons/CTAs).
- **Dark Mode First**: Focus on rich blacks (`#050505` not `#000000`) and desaturated accents for eye comfort.

## Typography
- Use `Inter` or `Geist Sans` for UI. 
- **Tracking**: Use tighter tracking (`-0.02em`) for headings and wider tracking (`0.05em`) for uppercase.
- **Line Height**: Tighter for headings (1.1-1.2), looser for body text (1.5-1.6).

## Motion (Framer Motion)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
```
- **Stagger Children**: Always stagger list items for a premium feel.
- **Layout Animations**: Use `layout` prop for smooth resizing.

## Accessibility (A11y)
- **Contrast**: Ensure text passes WCAG AA (4.5:1).
- **Focus States**: Never remove default outline without replacing it with a custom `ring`.
- **Reduced Motion**: Respect `prefers-reduced-motion` media query.
