---
title: Elevation
description: Depth, shadows, and z-index strategy.
tags: [elevation, shadows, z-index, design-system]
---

# Elevation

Depth, shadows, and z-index strategy.

Elevation creates visual hierarchy through shadows and z-index. A consistent scale makes depth predictable, themable, and accessible. Shadows should adapt to light and dark modes without arbitrary pixel values.

## Elevation philosophy

Depth should feel intentional, not decorative.

Elevation is how the interface says "this stands above that." Without a system, shadows become arbitrary — different values in different components, impossible to them, and contradictory in dark mode. A scale fixes this: every component references the same tokens, and switching themes adjusts the whole set at once.

The goal is for elevation to earn its keep. Each level should have a clear purpose: level-1 for subtle surface separation, level-2 for cards and panels, level-3 for modals and dropdowns. Nothing above level-3 unless there is a very good reason.

**Rules**

- Use a consistent elevation scale — never arbitrary pixel values.
- Each level should have a documented purpose.
- Shadows must adapt to both light and dark modes.
- z-index should reference the same scale.
- Avoid more than 4 elevation levels.

## The elevation scale

A 5-level scale with documented purposes.

The scale should be documented from level-0 (flat) up to the maximum level your system uses. Beyond that, components should not go. Here is a common starting point:

- level-0: flat, no shadow — used for canvases, SVGs, and elements that should not appear raised
- level-1: subtle shadow — used for hover states, active buttons, focused inputs
- level-2: medium shadow — used for cards, panels, list items
- level-3: strong shadow — used for modals, dropdowns, popovers
- level-4: extra strong shadow — used rarely, only for heavy dialogue windows

Each level includes a box-shadow CSS value and a z-index. When switching themes, the whole scale shifts together — you never adjust individual levels in isolation.

**Examples**

- Hover button: box-shadow: var(--shadow-sm); z-index: var(--z-index-1)
- Card: box-shadow: var(--shadow-md); z-index: var(--z-index-2)
- Modal: box-shadow: var(--shadow-lg); z-index: var(--z-index-3)

**Rules**

- Define all 5 levels in CSS custom properties.
- z-index follows the same numeric scale.
- Dark mode adjusts the shadow color and spread, not the level.
- Never skip levels — if you need more depth, reconsider the hierarchy.
- Document each level's purpose before shipping.

## z-index strategy

z-index should use the same scale as shadows.

z-index and shadows are two sides of the same coin. When you raise an element's z-index, you should also give it a proportional shadow. This makes the visual relationship between elements explicit and consistent.

Never use raw z-index values (999, 9999) — they break theming and create cascade issues. Always reference the scale.

**Examples**

- Nav: z-index: var(--z-index-1)
- Dropdown: z-index: var(--z-index-2)
- Modal: z-index: var(--z-index-3)
- Drawer: z-index: var(--z-index-3)
- Toast: z-index: var(--z-index-4) — transient, highest

**Rules**

- Never use raw numbers like 999 or 9999.
- z-index must pair with a proportional shadow.
- Drawer and modal both use the same level — drawer can be lower if it has a backdrop.
- Transient UI (toasts, snackbars) gets the highest level.
- Test z-index in both light and dark modes.

## Elevation in dark mode

Elevation in dark mode.

Shadows must adapt, not invert.

Inverting shadows (making them larger or darker) in dark mode usually looks wrong — they can appear as floating blobs or lose contrast. Instead, adjust the shadow color, spread, and opacity while keeping the same level number. The scale numbers stay; only the CSS values shift.

Best practice: keep the elevation level the same, but in dark mode use a darker shadow color with reduced spread so it reads as a soft lift rather than a harsh offset.

**Examples**

- level-1 light: var(--shadow-sm)
- level-1 dark: 0 1px 2px 0 rgba(0, 0, 0, 0.3)
- level-2 light: var(--shadow-md)
- level-2 dark: 0 4px 6px -1px rgba(0, 0, 0, 0.4)
- level-3 light: var(--shadow-lg)
- level-3 dark: 0 10px 15px -3px rgba(0, 0, 0, 0.45)

**Rules**

- Keep the level number the same across themes.
- Adjust color, spread, and opacity — not the level.
- Test shadow readability in both themes.
- Avoid inverted shadows (never make them larger/darker in dark mode).
- Use color-mix in CSS for smooth transitions between themes.

## Practical guidelines

Practical tips for applying elevation consistently.

Start with level-0 as the baseline. Only raise elevation when the visual hierarchy requires it. Use the same shadow scale in CSS and in the design system documentation. Always test in both light and dark modes. Document each level's purpose so teammates know when to reach for which level.

**Rules**

- Start with level-0 as the baseline.
- Only raise elevation when the hierarchy requires it.
- Use the same scale in CSS, documentation, and components.
- Always test in both light and dark modes.
- Document each level's purpose before shipping.
- Never exceed the documented maximum without a codemod and release note.

## Checklist

Verify your elevation implementation.

- **Scale**: All 5 levels documented in CSS custom properties. z-index follows the same numeric scale.
- **Dark mode**: Shadows adapt to dark mode without arbitrary changes. Level numbers stay the same.
- **z-index**: z-index references the same scale as shadows. No raw numbers.
- **Components**: Every component uses elevation tokens, not hard-coded shadows.
