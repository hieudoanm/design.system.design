---
title: Layout
description: Structured layouts with consistent alignment, spacing and containers.
tags: [layout, spacing, responsive, design-system]
---

# Layout

Structured layouts with consistent alignment, spacing and containers.

A predictable layout system uses containers for max-width, a scale for consistent spacing, and deliberate alignment choices. Combine with the spacing scale and responsive breakpoints to build pages that hold together across screen sizes.

## Layout philosophy

Layout should guide the eye and respect the user.

The best layouts feel effortless — everything has its place, the eye knows where to go next, and the design feels balanced whether on a phone or a television. A predictable layout system uses containers to set boundaries, a scale for consistent spacing, and deliberate alignment choices so the same pattern works everywhere.

The key is to avoid arbitrary pixel values and instead reach for the tokens the system already provides. That way, when you need to add a new page or adjust an existing one, you spend less time fighting the layout and more time on the content.

**Rules**

- Use containers to bound prose and restrict measure.
- Stick to the spacing scale — no magic numbers.
- Choose alignment based on the relationship between items.
- Test at every breakpoint before marking done.

## Stack: vertical, horizontal, nested

The three basic stack directions.

A stack is a flex-direction: column or row. Use vertical when items should top-to-bottom (forms, lists). Use horizontal when items should side-by-side (action bars, tags). Use nested stacks for complex regions (sidebar + content, header with nav, masthead). Always provide a fallback — on narrow screens, a horizontal stack should become vertical.

Prefer \`gap\` over adding margins to children in flex/grid containers.

**Examples**

- Vertical stack: form fields, list of items, vertically centered content
- Horizontal stack: tag chips, action buttons, pagination controls
- Nested stack: sidebar + main content header with nav

**Rules**

- Always provide a responsive fallback (column → row at breakpoint).
- Use \`gap\` instead of margins on flex children.
- Keep the stack direction consistent within a region.
- Never rely on margins alone for stack layout.

## Alignment

How items position within their container.

Alignment determines the horizontal or vertical position of items within a flex or grid container. The six options are: start / center / end / stretch for the main axis, and start / center / end / stretch for the cross axis. Choose the option that reflects the relationship between the items.

When in doubt, start (left / top) is the safest default. Center should be reserved for things that are meant to be focal points. End is useful for action bars and meta information.

**Examples**

- Form labels left-aligned, inputs left-aligned
- Pagination centered
- Tag chips start-aligned with wrapping
- Hero image stretch to fill width

**Rules**

- Start (left / top) is the safest default for most content.
- Reserve center for focal points: hero images, taglines, errors.
- Use end for action bars, meta, and secondary actions.
- Stretch should be deliberate — not the default for every item.
- Be consistent: all form labels align the same way.

## Grid & containers

12-column grid with consistent gutters and responsive breakpoints.

A 12-column grid provides enough flexibility for most layouts while staying simple enough to maintain. Combine with the spacing scale for gutters, and pair with container max-widths for readable measure. The grid responds to breakpoints defined as tokens — typically \`sm\`, \`md\`, \`lg\`, \`xl\` — where columns change, gutters change, and containers change.

Use containers to bound the grid and restrict measure. The grid should rarely be used inside a container wider than its max-width.

**Examples**

- One column: full width on mobile, fraction on desktop
- Two columns: col-6 on desktop, full width on mobile
- Three columns: col-4 on desktop, two columns on tablet, one on mobile
- Hero image: stretch across full width with inset gutter

**Rules**

- Define breakpoints as tokens, not raw pixel values.
- Use the spacing scale for all grid-related spacing.
- Limit grid use to 12 columns maximum.
- Always pair with a container for measure control.
- Never nest grids unnecessarily — use stacks instead.

## Responsive layout

Layout that adapts to the available space.

Responsive design is not a set of breakpoints you check off. It is a decision about which properties change with the viewport: the number of columns, the order of blocks, and whether a sidebar becomes a drawer. Use the spacing scale for all spacing, and define breakpoints as tokens so the whole system agrees.

The useful question is: which properties need to change as the space changes? For most interfaces the answer is a short list: columns, order, and chrome. If you can name those three, you can pick breakpoints where they need to change and stop there.

**Examples**

- Columns change: single column mobile → two columns tablet → three columns desktop
- Order change: form fields stack vertically on mobile, side-by-side on desktop
- Chrome change: permanent bar → drawer → bottom tab as screen narrows

**Rules**

- Break where the layout breaks, not where a device happens to be.
- Prefer \`auto-fit\` and \`minmax\` grids so the layout responds without named breakpoints.
- Fewer breakpoints is better. Every one is a set of rules to maintain and test.
- Mobile-first: base styles target the narrow case, then widen.
- Never hide the primary action on a small screen. Change its layout, not its availability.

## Practical guidelines

Practical tips for applying the layout system.

Start with the stacking direction that matches the content, then add the container and grid. Use gap instead of margins, and always test at every breakpoint. In CSS, prefer logical properties and use rem units for scalability.

**Rules**

- Use vertical stack as the default direction.
- Add container for measure, then grid for alignment.
- Prefer gap over margins on flex/grid children.
- Test at every breakpoint before marking done.
- Responsive fallback: column → row at the breakpoint.
- Keep the primary action available on all screens.
- Consider touch targets (minimum 44x44px) when stacking horizontally.

## Checklist

Verify your layout implementation.

- **Structure**: Container bounds the content. Stack direction matches intent. Gap used instead of margins.
- **Responsive**: Breakpoints defined as tokens. Layout adapts across screen sizes. Primary action stays available.
- **Alignment**: Alignment choice matches the relationship between items. Consistent across the product.
- **Grid**: 12-column grid used where appropriate. Gutters from spacing scale. Nesting avoided when stack works.
