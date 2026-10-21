---
title: Atomic Design
description: The five-level hierarchy that structures design systems — atoms, molecules, organisms, templates and pages — plus the principles and practices that keep a design system healthy.
tags: [atomic-design, layout, design-system, architecture]
---

# Atomic Design

Atomic design: atoms, molecules, organisms, templates and pages.

A design system is a set of tokens, components and guidelines that lets many people build a consistent product quickly. Atomic design gives it a shape: small parts combine into bigger ones, and each layer only depends on the layers below it. Design tokens sit beneath atoms as the shared foundation.

## Introduction

A philosophy for building design systems.

Atomic design breaks down interfaces into fundamental building blocks. The five levels—atoms, molecules, organisms, templates, and pages—create a hierarchical system where each level is composed of the level below it. This ensures that everything built on top inherits consistency from the foundation.

The key insight is that atoms are not just HTML elements; they are styled, stateful components that reference design tokens. Molecules are purposeful groups of atoms. Organisms are distinct interface regions. Templates define page structure, and pages are specific instances with real content.

**Rules**

- Atoms style exclusively from design tokens.
- Molecules own the layout between their atoms.
- Organisms accept data through props, not fetching inside the component.
- Templates use slots (props or children) instead of hard-coding content.
- Pages are specific instances of templates with real content.

## Atoms

The smallest useful building blocks. They cannot be broken down further without losing their purpose.

An atom is a single HTML-level element with styling and states: a button, a text input, a label, an icon, a badge, a spinner. Atoms hold no business logic and know nothing about where they are used. They style exclusively from design tokens and ship with every state (default, hover, focus, active, disabled, loading, error) so everything built from them inherits a consistent baseline.

**Examples**

- Button, link, icon button
- Text input, checkbox, radio, switch, select
- Label, heading, paragraph, badge, avatar, spinner

**Rules**

- Style only from tokens.
- Cover every state: default, hover, focus, active, disabled, loading, error.
- Accept `className` and standard HTML props so consumers are not blocked.
- Prefer headless primitives (Radix, React Aria) for behaviour and keyboard support.

**Code:** Button.tsx

```tsx
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button data-variant={variant} data-size={size} className={cn('btn', className)} {...props} />
  );
}
```

## Molecules

Small groups of atoms that do one job together.

A molecule combines a few atoms into something with a single, clear purpose. A label, an input and a hint become a form field. An input and a button become a search box.

The test: if you can describe it in one short sentence without the word "and", it is probably a molecule.

**Examples**

- Form field (label, input, hint, error)
- Search box (input and submit button)
- Menu item (icon, label, shortcut)
- Stat (number, label, trend)

**Rules**

- Compose atoms. Do not restyle them from the inside.
- Own the layout between the atoms, such as spacing and alignment.
- Link labels, hints and errors with `aria-describedby` and `htmlFor`.

## Organisms

Larger sections made of molecules and atoms. Each one is a recognisable part of an interface.

An organism is a distinct region of a screen: a site header, a product card grid, a data table, a checkout form. It can hold state and talk to data, but its visual building blocks all come from lower levels.

Organisms are where components start to reflect your product, so keep the data layer separate from the presentation. Pass data in through props and let the page decide where it comes from.

**Examples**

- Site header with navigation and search
- Data table with sorting, filters and pagination
- Comment thread, pricing table, footer

**Rules**

- Accept data through props. Do not fetch inside the component.
- Handle empty, loading and error states explicitly.
- Make it responsive from the start.

## Templates

Page-level layouts that place organisms and show the structure of content, using placeholder content.

A template defines where things go: a header on top, a sidebar on the left, a content column, a footer. It deals with grid, spacing and responsive behaviour, and it works with content of any length.

Templates answer the question "what does this layout do when the content is short, long or missing?"

**Examples**

- Dashboard shell (sidebar, top bar, main area)
- Article layout with a table of contents
- Marketing page with full-width bands
- Settings page with a two-column form

**Rules**

- Use slots (props or children) instead of hard-coding content.
- Define behaviour at each breakpoint.
- Test it with the longest, shortest and empty content you can imagine.

## Pages

Templates filled with real content. The level where you test whether the system holds up.

A page is a specific instance of a template with real data. It is the final check: if a real page breaks the layout, the fix belongs in the template or the organism, not in a one-off override.

Pages are usually owned by product teams, not the design system. They import from the system and report what is missing.

**Examples**

- The signed-in dashboard for a customer with 300 projects
- A product page with a very long title and no image
- A checkout with a validation error on three fields

**Rules**

- Do not patch the system with local CSS. Fix the source.
- Turn repeated page-level patterns into new organisms or templates.
- Run visual tests on real content, including edge cases.

## Practical guidelines

Practical tips for applying atomic design.

Start with the atoms that are most commonly used in your product. Build molecules from those atoms, then organisms from molecules. Templates and pages emerge naturally as the system grows. Avoid creating atoms just for the sake of the framework — every atom should have a purpose.

**Rules**

- Start with commonly used atoms.
- Build molecules intentionally, not by force.
- Organisms should reflect real interface regions.
- Templates define structure, not specific pages.
- Pages are owned by product teams.

**Do**

- Focus on real use cases. Atoms should have multiple states. Organisms should handle empty and loading states.

**Don't**

- Do not create atoms without a clear purpose. Do not hard-code content in templates.

## Checklist

Verify your atomic design implementation.

- **Hierarchy**: Atoms → Molecules → Organisms → Templates → Pages follows a consistent structure.
- **Consistency**: Atoms style from tokens. Molecules own their layout. Organisms accept data via props.
- **Responsiveness**: Organisms and templates are responsive from the start. Pages adapt to content changes.
