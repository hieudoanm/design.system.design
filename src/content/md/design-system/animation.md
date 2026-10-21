---
title: Animation
description: Motion as a system — duration/easing tokens, choreography rules, component state transitions, reduced motion handling, and Framer Motion implementation patterns.
tags: [animation, motion, choreography, reduced-motion, framer-motion, tokens]
---

# Animation

Motion as a system: tokens, choreography, and accessibility.

Animation is not decoration — it communicates state, guides attention, and makes interactions feel causal. A motion system defines tokens for duration and easing, choreography rules for multi-element sequences, and accessibility guardrails so motion helps rather than harms.

## Principles

Why we animate, and how we decide.

### Motion has a job

Every animation answers a question: where did this come from? where is it going? what just happened? If you cannot name the question, the animation is decoration — remove it.

### Fast by default

The default duration is 200ms. Users perceive interfaces as faster when transitions are snappy. Reserve slower durations (300ms+) for full-screen transitions where context shift is large.

### Easing communicates physics

Ease-out for things leaving (they have momentum). Ease-in for things arriving (they are accelerating). Ease-in-out for things moving in place. Linear only for mechanical motion (spinners, progress).

### Choreography over simultaneity

When multiple elements animate, stagger them. A 50ms stagger per element creates a wave that feels intentional. Simultaneous animation feels like a glitch.

### Respect the user

prefers-reduced-motion is not optional. Honor it by removing transform motion, keeping only instant opacity/color changes. Never disable it because "the animation looks better."

**Rules**

- No animation without a token. Hard-coded durations are bugs.
- Default duration: 200ms. Default easing: ease-in-out.
- Stagger: 50ms per element, max 300ms total cascade.
- Honor prefers-reduced-motion for every transform animation.
- Test at 200% zoom — animations must not cause layout shift.

## Motion tokens

Duration and easing as design tokens. Never hard-code.

**Code:** app/globals.css

```css
@theme {
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easings */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

:root {
  /* Default transition for most properties */
  --transition-default: var(--duration-normal) var(--ease-in-out);
}

/* Reduced motion: collapse all transform transitions */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

| Token              | Value                             | Use case                             |
| ------------------ | --------------------------------- | ------------------------------------ |
| --duration-instant | 0ms                               | Color changes, opacity toggles       |
| --duration-fast    | 100ms                             | Hover states, small transitions      |
| --duration-normal  | 200ms                             | Default: panels, modals, menus       |
| --duration-slow    | 300ms                             | Page transitions, complex expansions |
| --duration-slower  | 500ms                             | Full-screen transitions              |
| --ease-linear      | linear                            | Mechanical: spinners, progress bars  |
| --ease-in          | cubic-bezier(0.4, 0, 1, 1)        | Elements entering from off-screen    |
| --ease-out         | cubic-bezier(0, 0, 0.2, 1)        | Elements exiting, dismissals         |
| --ease-in-out      | cubic-bezier(0.4, 0, 0.2, 1)      | Default: most transitions            |
| --ease-spring      | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful: toasts, celebrations        |

**Rules**

- Use tokens in CSS: transition: var(--transition-default);
- Use tokens in JS: transition: { duration: 200, easing: [0.4, 0, 0.2, 1] }
- Instant (0ms) for color/opacity only. Never for transform.
- Spring easing only for delight moments (toasts, success states), not utility.

> [Inline SVG drawing — Four easing curves: linear, ease-in, ease-out, ease-in-out]

## Choreography

How multiple elements move together.

> [Inline SVG drawing — Staggered entrance]

A 50ms stagger per element. Parent starts at 0ms. Each child starts 50ms later. Total cascade: 200ms for 4 elements. The eye follows the wave, understanding hierarchy.

### Parent-first

Container animates in, then children stagger. Never children before parent — it breaks spatial logic.

### Stagger delay

50ms per element is the sweet spot. Faster feels simultaneous; slower feels sluggish. Cap total cascade at 300ms.

### Directional consistency

Elements entering from the same direction (e.g., all sliding up) stagger together. Mixed directions need separate choreography.

### Exit choreography

Reverse order, faster (75% of entrance duration). Elements leave before the container — the stage clears before the curtain falls.

**Rules**

- Stagger delay: 50ms per element.
- Max cascade duration: 300ms.
- Exit is reverse order, 75% duration.
- Shared direction = shared choreography.

## Component state transitions

Standard transitions for interactive states.

> [Inline SVG drawing — Button state transitions]

Hover: 100ms ease-out (quick response). Active: 0ms (instant feedback). Focus: 0ms (accessibility). Disabled: no transition, visual only.

| Component          | Entrance                               | Exit                           | State changes                   |
| ------------------ | -------------------------------------- | ------------------------------ | ------------------------------- |
| Modal / Dialog     | Fade + scale(0.95→1), 200ms            | Fade + scale(1→0.95), 150ms    | Focus trap, Escape to close     |
| Dropdown / Popover | Fade + translateY(-4→0), 150ms         | Fade + translateY(0→-4), 100ms | Arrow flip, 100ms               |
| Toast / Snackbar   | Slide up + fade, 200ms (spring)        | Slide down + fade, 200ms       | Progress bar drain              |
| Tabs               | Cross-fade panels, 150ms               | —                              | Indicator slide, 200ms ease-out |
| Accordion          | Height auto, 200ms ease-in-out         | Height 0, 200ms ease-in-out    | Chevron rotate, 150ms           |
| Sidebar / Drawer   | Slide from edge + fade backdrop, 250ms | Slide to edge + fade, 200ms    | Backdrop click closes           |
| Tooltip            | Fade + scale(0.8→1), 100ms             | Fade + scale(1→0.8), 50ms      | Follow cursor, 0ms delay        |
| Carousel           | Slide translateX, 300ms ease-in-out    | —                              | Dot indicator, 200ms            |

**Rules**

- Hover/focus: fast (100ms) — the user is already there.
- Active/press: instant (0ms) — direct manipulation feels immediate.
- Focus ring: 0ms transition — accessibility cannot wait.
- Disabled: no transition — it is a state, not an interaction.
- Loading: pulse or spinner with --ease-linear, --duration-slow.

## Reduced motion

prefers-reduced-motion: reduce is a user need, not a preference.

**Code:** app/globals.css

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all transform and complex animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep instant color/opacity changes */
  .btn:hover,
  .btn:focus {
    transition: background-color 0ms, color 0ms;
  }

  /* Spinners: show static frame or pulse instead of rotation */
  .spinner {
    animation: none;
    opacity: 0.7;
  }

  /* Carousels: pause auto-play */
  .carousel[data-auto] {
    animation-play-state: paused;
  }

  /* Smooth scroll: off */
  html {
    scroll-behavior: auto;
  }
}

/* JavaScript check */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  // Skip Framer Motion initial/animate, use only exit
}
```

| Motion type                      | Reduced behavior                          |
| -------------------------------- | ----------------------------------------- |
| Transform (slide, scale, rotate) | Remove transform, fade only               |
| Opacity fade                     | Keep, but instant (0ms)                   |
| Color/background transition      | Keep, instant                             |
| Spinner/loader rotation          | Stop rotation, show static frame or pulse |
| Parallax/scroll-linked           | Disable entirely                          |
| Auto-advance carousel            | Pause auto-advance, keep manual controls  |
| Spring/bounce                    | Remove spring, use ease-out               |

**Rules**

- Transform animations (slide, scale, rotate): remove entirely, fade only.
- Opacity/color transitions: keep but instant (0ms).
- Spinners: stop rotation, show static frame or gentle pulse.
- Auto-advance carousels: pause, keep manual controls.
- Parallax and scroll-linked animations: disable entirely.
- Test: enable "Reduce motion" in OS settings, verify no transform animation runs.

## Implementation patterns

How to apply the system in React components.

**Code:** lib/motion.ts

```ts
import { Variants, Transition } from 'motion/react';

/* Standard transitions from tokens */
export const transitions = {
  default: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  fast: { duration: 0.1, ease: [0, 0, 0.2, 1] },
  slow: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  instant: { duration: 0 },
} as const satisfies Record<string, Transition>;

/* Choreography variants */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
  exit: { opacity: 0, y: -10, transition: transitions.fast },
};

export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.default },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
};

/* Reduced motion guard */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/* Usage in a component */
function CardList({ items }) {
  const reduced = useReducedMotion();
  return (
    <motion.ul
      variants={reduced ? {} : staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={reduced ? {} : fadeSlideUp}
        >
          <Card {...item} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

**Rules**

- Centralize variants in lib/motion.ts — do not inline variants in components.
- Use useReducedMotion() hook to conditionally disable variants.
- Exit animations must be fast — the user has already decided to leave.
- Animate presence (AnimatePresence) for mount/unmount, not conditional rendering.

## Checklist

Before shipping an animated component.

### Token compliance

All durations and easings reference motion tokens. No hard-coded values.

### Reduced motion tested

Enable OS "Reduce motion" — verify no transform animation runs, only instant opacity/color.

### Performance

Animate only transform and opacity. Layout-triggering properties (width, height, top, left) are banned.

### Choreography

Multi-element animations use stagger (50ms). Total cascade ≤ 300ms.

### Exit animations

Every entrance has a matching exit. Exit is reverse order, 75% duration.

### Accessibility

Focus states animate at 0ms. No animation blocks keyboard navigation.
