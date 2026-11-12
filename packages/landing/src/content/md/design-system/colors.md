---
title: Colors
description: A systematic approach to color with purpose, contrast, and accessibility.
---

# Colors

A systematic approach to color with purpose, contrast, and accessibility.

Colors communicate hierarchy, state, and brand identity. A color system uses
primitives for raw values and semantics for meaning, ensuring consistent
theming, accessibility, and maintainability across light and dark modes.

## Color philosophy

Color should communicate meaning, not just decoration.

Every color in the system has a purpose. Use color to guide attention, indicate
state, and establish hierarchy. Avoid using color as the only means of
communication — pair it with icons, text, or patterns for accessibility. The key
principle is to separate what the color is (primitive) from why it is used
(semantic). This separation enables theming, dark mode support, and brand
flexibility without rewriting components.

**Rules**

- Use color to communicate meaning and hierarchy.
- Never rely on color alone to convey information.
- Separate primitives (raw values) from semantics (purpose).
- Design for both light and dark modes from the start.

## Primitive palette

The full range of available color values.

Primitives are raw color values with no semantic meaning. They form the
foundation of the color system and are referenced by semantic tokens. Keep
primitives generic and flexible so they can support multiple themes. A good
primitive palette includes neutrals for text and surfaces, plus a brand color
and a full set of feedback colors (success, warning, danger, info). Limit the
number of primitives to avoid decision paralysis.

**Examples**

- Neutrals: gray-50 through gray-900 for text, surfaces, and borders
- Brand: blue-600 as the primary action color
- Success: emerald-600 for positive states
- Warning: amber-600 for cautionary states
- Danger: red-600 for destructive states

**Rules**

- Primitives have no meaning — only values.
- Use a numeric scale (50-900) for consistency.
- Include enough steps for states (hover, active, disabled).
- Keep primitives out of component code.

## Semantic color roles

Colors named by their purpose, not their appearance.

Semantic tokens describe how color is used: color-text, color-action-bg,
color-surface, color-danger. These names remain valid even if the underlying
primitive changes. Components always reference semantic tokens, never primitives
directly. This indirection is what makes theming possible. When switching to
dark mode, you re-map semantics to different primitives without touching a
single component.

**Examples**

- Text: primary, secondary (muted), disabled
- Surfaces: background (paper), default, raised, overlay
- Actions: primary, secondary, ghost, destructive
- Borders: default, strong, focus
- Feedback: success, warning, danger, info

**Rules**

- Name by purpose: color-danger, not color-red.
- Components only use semantic tokens.
- Each semantic role should have states (default, hover, active, disabled).
- Provide background tints for feedback messages.

## Surface hierarchy

Layering creates depth and visual order.

Surfaces are the backgrounds where content sits. A clear hierarchy helps users
understand what is foreground vs background. Typically: paper (page background)
-> surface (cards, panels) -> surface-raised (modals, dropdowns, popovers). Each
level up should have slightly different treatment — often a subtle background
change, border, or shadow. This creates natural elevation without relying solely
on shadows.

**Rules**

- Use consistent surface levels across the application.
- Raised surfaces should sit above their containers.
- Consider borders or shadows to reinforce elevation.
- Maintain sufficient contrast between text and surfaces.

## Contrast & accessibility

Readable color combinations are non-negotiable.

WCAG 2.2 AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1
for large text (18.66px bold or 24px regular). UI components like buttons,
icons, and focus indicators need 3:1 against adjacent colors. Always check
contrast in both light and dark modes. Automated testing in CI catches
regressions before they reach users. Remember: color alone must never convey
critical information.

**Examples**

- Body text on white: #111827 achieves high contrast
- Muted text needs careful selection: aim for >=4.5:1 when used alone
- Primary buttons on white: ensure background meets 3:1 for the button itself
- Focus indicators need 3:1 against the background

**Rules**

- Normal text: minimum 4.5:1 contrast ratio.
- Large text (>=24px or >=18.66px bold): minimum 3:1.
- UI components and graphics: minimum 3:1.
- Test all color pairings in every theme.
- Never use color alone to indicate state or status.

**Code:** contrast-check.ts

```ts
function getContrast(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// WCAG AA: >= 4.5 for normal text, >= 3 for large/UI
const passesAA = (ratio: number, isLarge = false) => (isLarge ? ratio >= 3 : ratio >= 4.5);
```

## Theming & dark mode

One system, multiple themes.

Themes are just different mappings of semantic tokens to primitive values.
Switching themes means changing those mappings, not rewriting components. Use
data-theme on the root element and respect prefers-color-scheme for automatic
detection. In dark mode, you typically need higher contrast, desaturated brand
colors, and adjusted surface colors. Avoid simply inverting colors — carefully
re-select primitives for optimal readability in low-light environments.

**Rules**

- Use data-theme="dark" attribute on <html>.
- Respect prefers-color-scheme as the default.
- Store user preference in localStorage.
- Dark mode is token remapping, not component duplication.
- Re-verify contrast ratios in dark mode.
- Consider prefers-contrast and forced-colors modes.

**Code:** tokens.css

```ts
:root {
  /* Light theme */
  --color-paper: #ffffff;
  --color-surface: #f9fafb;
  --color-text: #111827;
  --color-action-bg: #1f4fd8;
}

[data-theme="dark"] {
  /* Dark theme */
  --color-paper: #0f172a;
  --color-surface: #111827;
  --color-text: #f3f4f6;
  --color-action-bg: #5b86f5;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-paper: #0f172a;
    --color-surface: #111827;
    --color-text: #f3f4f6;
    --color-action-bg: #5b86f5;
  }
}
```

## Usage guidelines

Practical rules for applying colors.

Follow these guidelines to maintain consistency and accessibility across your
product. When in doubt, favor semantic meaning over aesthetic preference.

**Rules**

- Use the action color sparingly for primary calls-to-action.
- Use neutral colors for most text and UI chrome.
- Reserve feedback colors for their specific states.
- Ensure disabled states have reduced opacity but remain distinguishable.
- Avoid using brand colors for error states.
- Test in grayscale to verify hierarchy without color.
- Consider color blindness — use patterns/shapes as backups.

## Checklist

Verify your color implementation.
