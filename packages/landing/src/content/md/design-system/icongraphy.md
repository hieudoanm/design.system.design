---
title: Iconography
description: A coherent icon system — 24×24 grid, 2px stroke, 4 style variants, 12 core icons, sizing tokens, accessibility patterns, and implementation.
tags: [icons, iconography, design-system, accessibility, svg]
---

# Iconography

A coherent icon system: grid, style, sizing, and accessibility.

Icons are the visual vocabulary of an interface. A consistent system — fixed grid, unified stroke, optical alignment, and clear semantics — makes icons feel like part of the same family, not a collected set.

## Principles

The rules that keep the set coherent.

### One grid, one stroke

Every icon is drawn on a 24×24 grid with a 2px stroke. No exceptions. This ensures visual weight is consistent whether the icon sits alone or next to text.

### Optical alignment over mathematical

Center the visual weight, not the bounding box. A triangle points up but its mass sits lower — nudge it up. A speech bubble has its tail — shift the bubble so the whole form feels centered.

### Metaphors from the platform, not the brand

Use the metaphors users already know: magnifier for search, gear for settings, trash for delete. Novel metaphors cost learning time; standard ones are invisible in a good way.

### Style follows function

Outline for default, filled for selected/active, two-tone for hierarchy, sharp for developer tools. Each style has a semantic purpose, not just aesthetic preference.

**Rules**

- Never mix stroke weights in the same view.
- Never scale an icon non-uniformly — it distorts the stroke.
- Reserve filled style for selected states and high-emphasis actions.
- Keep the icon set under 200 glyphs. Beyond that, it is a library, not a system.

## Anatomy of a system icon

Every icon shares the same construction.

> [Inline SVG drawing — The 24×24 grid]

A 2px padding (safe zone) inside the 24×24 viewBox. The 2px stroke sits on the 2px/22px lines. Optical center marked at 12,12 — but actual center of mass may differ.

The grid is the contract. Every glyph — whether a simple home or a complex settings gear — lives inside the same 24×24 viewBox with a 2px safe zone. The stroke is always 2px, always centered on the pixel grid. This means a 24px icon rendered at 24px has crisp, pixel-perfect edges.

## Style variants

Four styles, each with a semantic role.

### Outline (default)

2px stroke, no fill. The standard style for toolbar and inline icons.

> [Inline SVG drawing — Outline home icon]

### Filled

Solid fill, no stroke. Used for high-emphasis actions and tab bar selected states.

> [Inline SVG drawing — Filled home icon]

### Two-tone

Primary stroke with secondary fill at 40% opacity. For complex icons needing visual hierarchy.

> [Inline SVG drawing — Two-tone home icon]

### Sharp

Sharp corners, 2px stroke. For technical or developer-focused interfaces.

> [Inline SVG drawing — Sharp home icon]

**Rules**

- Outline is the default — use it everywhere unless another style is semantically required.
- Filled = selected/active state (tab bar, toggle on). Never mix filled and outline in the same control group.
- Two-tone reserved for complex icons where a single stroke cannot express hierarchy (e.g., cloud with sync arrows).
- Sharp is opt-in for developer-facing surfaces only.

## Core icon set

The 12 icons every interface needs. Extend from here, but start with these.

> [Inline SVG drawing — Grid icon: Home]
> [Inline SVG drawing — Grid icon: Search]
> [Inline SVG drawing — Grid icon: User]
> [Inline SVG drawing — Grid icon: Settings]
> [Inline SVG drawing — Grid icon: Mail]
> [Inline SVG drawing — Grid icon: Bell]
> [Inline SVG drawing — Grid icon: Folder]
> [Inline SVG drawing — Grid icon: Download]
> [Inline SVG drawing — Grid icon: Upload]
> [Inline SVG drawing — Grid icon: Trash]
> [Inline SVG drawing — Grid icon: Edit]
> [Inline SVG drawing — Grid icon: Eye]
> [Inline SVG drawing — Grid icon: Star]

**Rules**

- Name icons by metaphor, not by feature: "search", not "header-search".
- Add new icons only when an existing metaphor genuinely does not fit.
- Run new icons through the grid check: stroke 2px? safe zone respected? optical center aligned?

## Sizing tokens

Size icons with tokens, not pixels. The token maps to a context, not a pixel value.

**Code:** app/globals.css

```css
@theme {
  --icon-xs: 16px;
  --icon-sm: 20px;
  --icon-md: 24px;
  --icon-lg: 32px;
  --icon-xl: 48px;
}

.icon {
  width: var(--icon-md);
  height: var(--icon-md);
}
.icon-sm {
  width: var(--icon-sm);
  height: var(--icon-sm);
}
.icon-lg {
  width: var(--icon-lg);
  height: var(--icon-lg);
}
```

| Token     | Size | Use case                                   |
| --------- | ---- | ------------------------------------------ |
| --icon-xs | 16px | Inline with caption text, dense tables     |
| --icon-sm | 20px | Inline with body text, button icons        |
| --icon-md | 24px | Default: toolbar, navigation, card actions |
| --icon-lg | 32px | Feature callouts, empty states             |
| --icon-xl | 48px | Hero illustrations, onboarding steps       |

**Rules**

- Icon size always matches the text size it sits next to: 16px text → 16px icon, 24px heading → 24px icon.
- Never hard-code icon dimensions in components. Use the token.
- The token system allows a global scale change (e.g., compact mode) without touching components.

## Accessibility

Icons are invisible to screen readers unless you make them visible.

**Code:** components/Icon.tsx

```tsx
export function Icon({
  name,
  size = 'md',
  'aria-label': label,
  'aria-hidden': hidden,
  ...props
}: IconProps) {
  const svg = ICON_REGISTRY[name];
  if (!svg) return null;

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={hidden}
      focusable="false"
    >
      <title>{label}</title>
      {svg}
    </svg>
  );
}

// Usage:
<Icon name="search" aria-label="Search" />
<Icon name="chevron-down" aria-hidden="true" /> // next to "Sort" text
```

| Scenario                 | Implementation                               |
| ------------------------ | -------------------------------------------- |
| Decorative icon          | aria-hidden="true" + no visible label needed |
| Standalone icon button   | aria-label="Action name" on button           |
| Icon with visible label  | aria-hidden="true" on icon, label in text    |
| Icon as status indicator | role="img" + aria-label with state           |
| Animated icon            | respect prefers-reduced-motion               |

**Rules**

- Decorative icons: aria-hidden="true". The screen reader ignores them.
- Standalone icon buttons: aria-label on the button with the action name.
- Icon + text label: aria-hidden="true" on the icon, let the text speak.
- Status icons (error, success, loading): role="img" + aria-label describing the state.
- Animated icons (spinners): respect prefers-reduced-motion, provide text alternative.

## Implementation

A single registry, a single component, tree-shakeable.

**Code:** components/icons/registry.ts

```ts
// Generated from SVG files at build time — do not edit by hand
export const ICON_REGISTRY: Record<string, React.ReactNode> = {
  home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  search: <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />,
  // ... all icons
};

// components/Icon.tsx
export function Icon({ name, size = 'md', ...props }: IconProps) {
  const path = ICON_REGISTRY[name];
  return path ? (
    <svg viewBox="0 0 24 24" width={size} height={size} {...props}>{path}</svg>
  ) : null;
}
```

**Rules**

- Store source SVGs in /icons/src, generate registry at build.
- Tree-shaking: only imported icons end up in the bundle.
- No runtime SVG parsing — the registry is pure React nodes.
- TypeScript keys: the registry keys are the only valid icon names.

## Checklist

Before shipping a new icon.

### Grid conformance

24×24 viewBox, 2px stroke, 2px safe zone, centered on pixel grid.

### Optical alignment

Visual center matches 12,12. Nudge if the metaphor pulls weight off-center.

### Style correctness

Outline by default. Filled only for selected states. Two-tone only when needed.

### Accessibility

Has a clear semantic name. Works with aria-label and aria-hidden patterns.

### Token sizing

Renders correctly at --icon-xs through --icon-xl without stroke distortion.
