import type { Topic } from '../index';
import { container, stack, alignment, grid_example } from './svg-generated';

const gridCss = `.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(12, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(12, 1fr);
  }
}

.container {
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding-inline: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-inline: var(--space-8);
  }
}`;

const componentExampleTsx = `// Section component using layout tokens
export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="section" style={{
      padding: "var(--space-8)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      maxWidth: "1280px",
      marginInline: "auto"
    }}>
      {heading && <h2 style={{ marginBottom: "var(--space-4)" }}>{heading}</h2>}
      {children}
    </section>
  );
}`;

export const layout: Topic = {
  slug: 'layout',
  title: 'Layout',
  tagline: 'Structured layouts with consistent alignment, spacing and containers.',
  summary:
    'A predictable layout system uses containers for max-width, a scale for consistent spacing, and deliberate alignment choices. Combine with the spacing scale and responsive breakpoints to build pages that hold together across screen sizes.',
  group: 'structure',
  sections: [
    {
      id: 'philosophy',
      title: 'Layout philosophy',
      intro: 'Layout should guide the eye and respect the user.',
      body: 'The best layouts feel effortless — everything has its place, the eye knows where to go next, and the design feels balanced whether on a phone or a television. A predictable layout system uses containers to set boundaries, a scale for consistent spacing, and deliberate alignment choices so the same pattern works everywhere.\n\nThe key is to avoid arbitrary pixel values and instead reach for the tokens the system already provides. That way, when you need to add a new page or adjust an existing one, you spend less time fighting the layout and more time on the content.',
      rules: [
        'Use containers to bound prose and restrict measure.',
        'Stick to the spacing scale — no magic numbers.',
        'Choose alignment based on the relationship between items.',
        'Test at every breakpoint before marking done.',
      ],
      visuals: [
        {
          title: 'Container with responsive max-width',
          caption:
            'Content stays readable across screen sizes; the container shrinks and grows deliberately.',
          svg: container,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'stack',
      title: 'Stack: vertical, horizontal, nested',
      intro: 'The three basic stack directions.',
      body: 'A stack is a flex-direction: column or row. Use vertical when items should top-to-bottom (forms, lists). Use horizontal when items should side-by-side (action bars, tags). Use nested stacks for complex regions (sidebar + content, header with nav, masthead). Always provide a fallback — on narrow screens, a horizontal stack should become vertical.\n\nPrefer `gap` over adding margins to children in flex/grid containers.',
      examples: [
        'Vertical stack: form fields, list of items, vertically centered content',
        'Horizontal stack: tag chips, action buttons, pagination controls',
        'Nested stack: sidebar + main content header with nav',
      ],
      rules: [
        'Always provide a responsive fallback (column → row at breakpoint).',
        'Use `gap` instead of margins on flex children.',
        'Keep the stack direction consistent within a region.',
        'Never rely on margins alone for stack layout.',
      ],
      visuals: [
        {
          title: 'Stack: vertical, horizontal, nested',
          caption: 'The three stack directions and how they compose into regions.',
          svg: stack,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'alignment',
      title: 'Alignment',
      intro: 'How items position within their container.',
      body: 'Alignment determines the horizontal or vertical position of items within a flex or grid container. The six options are: start / center / end / stretch for the main axis, and start / center / end / stretch for the cross axis. Choose the option that reflects the relationship between the items.\n\nWhen in doubt, start (left / top) is the safest default. Center should be reserved for things that are meant to be focal points. End is useful for action bars and meta information.',
      examples: [
        'Form labels left-aligned, inputs left-aligned',
        'Pagination centered',
        'Tag chips start-aligned with wrapping',
        'Hero image stretch to fill width',
      ],
      rules: [
        'Start (left / top) is the safest default for most content.',
        'Reserve center for focal points: hero images, taglines, errors.',
        'Use end for action bars, meta, and secondary actions.',
        'Stretch should be deliberate — not the default for every item.',
        'Be consistent: all form labels align the same way.',
      ],
      visuals: [
        {
          title: 'Alignment: start, center, end, stretch',
          caption: 'Six alignment options across main and cross axes.',
          svg: alignment,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'grid',
      title: 'Grid & containers',
      intro: '12-column grid with consistent gutters and responsive breakpoints.',
      body: 'A 12-column grid provides enough flexibility for most layouts while staying simple enough to maintain. Combine with the spacing scale for gutters, and pair with container max-widths for readable measure. The grid responds to breakpoints defined as tokens — typically `sm`, `md`, `lg`, `xl` — where columns change, gutters change, and containers change.\n\nUse containers to bound the grid and restrict measure. The grid should rarely be used inside a container wider than its max-width.',
      examples: [
        'One column: full width on mobile, fraction on desktop',
        'Two columns: col-6 on desktop, full width on mobile',
        'Three columns: col-4 on desktop, two columns on tablet, one on mobile',
        'Hero image: stretch across full width with inset gutter',
      ],
      rules: [
        'Define breakpoints as tokens, not raw pixel values.',
        'Use the spacing scale for all grid-related spacing.',
        'Limit grid use to 12 columns maximum.',
        'Always pair with a container for measure control.',
        'Never nest grids unnecessarily — use stacks instead.',
      ],
      visuals: [
        {
          title: '12-column grid with gutters',
          caption: 'Column spanning with consistent gutters creates aligned layouts.',
          svg: grid_example,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      code: {
        label: 'grid.css',
        source: gridCss,
      },
    },
    {
      id: 'responsive',
      title: 'Responsive layout',
      intro: 'Layout that adapts to the available space.',
      body: 'Responsive design is not a set of breakpoints you check off. It is a decision about which properties change with the viewport: the number of columns, the order of blocks, and whether a sidebar becomes a drawer. Use the spacing scale for all spacing, and define breakpoints as tokens so the whole system agrees.\n\nThe useful question is: which properties need to change as the space changes? For most interfaces the answer is a short list: columns, order, and chrome. If you can name those three, you can pick breakpoints where they need to change and stop there.',
      examples: [
        'Columns change: single column mobile → two columns tablet → three columns desktop',
        'Order change: form fields stack vertically on mobile, side-by-side on desktop',
        'Chrome change: permanent bar → drawer → bottom tab as screen narrows',
      ],
      rules: [
        'Break where the layout breaks, not where a device happens to be.',
        'Prefer `auto-fit` and `minmax` grids so the layout responds without named breakpoints.',
        'Fewer breakpoints is better. Every one is a set of rules to maintain and test.',
        'Mobile-first: base styles target the narrow case, then widen.',
        'Never hide the primary action on a small screen. Change its layout, not its availability.',
      ],
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying the layout system.',
      body: 'Start with the stacking direction that matches the content, then add the container and grid. Use gap instead of margins, and always test at every breakpoint. In CSS, prefer logical properties and use rem units for scalability.',
      rules: [
        'Use vertical stack as the default direction.',
        'Add container for measure, then grid for alignment.',
        'Prefer gap over margins on flex/grid children.',
        'Test at every breakpoint before marking done.',
        'Responsive fallback: column → row at the breakpoint.',
        'Keep the primary action available on all screens.',
        'Consider touch targets (minimum 44x44px) when stacking horizontally.',
      ],
      code: {
        label: 'component-example.tsx',
        source: componentExampleTsx,
      },
      items: [
        {
          title: 'Do',
          body: 'Use vertical stack as default. Add container for measure. Test at breakpoints. Use gap over margins.',
        },
        {
          title: "Don't",
          body: "Don't use random pixel values. Don't hide primary actions on small screens. Don't skip the responsive fallback.",
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Verify your layout implementation.',
      items: [
        {
          title: 'Structure',
          body: 'Container bounds the content. Stack direction matches intent. Gap used instead of margins.',
        },
        {
          title: 'Responsive',
          body: 'Breakpoints defined as tokens. Layout adapts across screen sizes. Primary action stays available.',
        },
        {
          title: 'Alignment',
          body: 'Alignment choice matches the relationship between items. Consistent across the product.',
        },
        {
          title: 'Grid',
          body: '12-column grid used where appropriate. Gutters from spacing scale. Nesting avoided when stack works.',
        },
      ],
    },
  ],
};
