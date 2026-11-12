import type { Topic } from '../../index';
import { dark_shadow, level_0, level_1, level_2, level_3, level_4 } from './svg-generated';

const elevationTokensCss = `:root {
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --z-index-0: auto;
  --z-index-1: 1;
  --z-index-2: 2;
  --z-index-3: 3;
  --z-index-4: 4;
}`;

const elevationDarkCss = `.shape {
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.2s ease;
}

[data-theme="dark"] .shape {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}`;

const componentExampleTsx = `// Card component using elevation tokens
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card"
      style={{
        boxShadow: 'var(--shadow-md)',
        zIndex: 'var(--z-index-2)',
        background: 'var(--color-paper)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {children}
    </div>
  );
}`;

export const elevation: Topic = {
  slug: 'elevation',
  title: 'Elevation',
  tagline: 'Depth, shadows, and z-index strategy.',
  summary:
    'Elevation creates visual hierarchy through shadows and z-index. A consistent scale makes depth predictable, themable, and accessible. Shadows should adapt to light and dark modes without arbitrary pixel values.',
  group: 'structure',
  sections: [
    {
      id: 'philosophy',
      title: 'Elevation philosophy',
      intro: 'Depth should feel intentional, not decorative.',
      body: 'Elevation is how the interface says "this stands above that." Without a system, shadows become arbitrary — different values in different components, impossible to them, and contradictory in dark mode. A scale fixes this: every component references the same tokens, and switching themes adjusts the whole set at once.',
      rules: [
        'Use a consistent elevation scale — never arbitrary pixel values.',
        'Each level should have a documented purpose.',
        'Shadows must adapt to both light and dark modes.',
        'z-index should reference the same scale.',
        'Avoid more than 4 elevation levels.',
      ],
      visuals: [
        {
          title: 'Elevation level 0',
          caption: 'Flat surface with no shadow: the baseline for the scale.',
          svg: level_0,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
        {
          title: 'Elevation level 1',
          caption: 'Subtle shadow: hovers and small raised surfaces.',
          svg: level_1,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
        {
          title: 'Elevation level 2',
          caption: 'Card-level shadow: the most common raised surface.',
          svg: level_2,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
        {
          title: 'Elevation level 3',
          caption: 'Overlay shadow: modals, drawers and popovers.',
          svg: level_3,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
        {
          title: 'Elevation level 4',
          caption: 'Transient shadow: toasts and snackbars, the highest level.',
          svg: level_4,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'scale',
      title: 'The elevation scale',
      intro: 'A 5-level scale with documented purposes.',
      body: 'The scale should be documented from level-0 (flat) up to the maximum level your system uses. Beyond that, components should not go. Here is a common starting point:',
      examples: [
        'Hover button: box-shadow: var(--shadow-sm); z-index: var(--z-index-1)',
        'Card: box-shadow: var(--shadow-md); z-index: var(--z-index-2)',
        'Modal: box-shadow: var(--shadow-lg); z-index: var(--z-index-3)',
      ],
      rules: [
        'Define all 5 levels in CSS custom properties.',
        'z-index follows the same numeric scale.',
        'Dark mode adjusts the shadow color and spread, not the level.',
        'Never skip levels — if you need more depth, reconsider the hierarchy.',
        "Document each level's purpose before shipping.",
      ],
      code: {
        label: 'elevation-tokens.css',
        source: elevationTokensCss,
      },
    },
    {
      id: 'z-index',
      title: 'z-index strategy',
      intro: 'z-index should use the same scale as shadows.',
      body: "z-index and shadows are two sides of the same coin. When you raise an element's z-index, you should also give it a proportional shadow. This makes the visual relationship between elements explicit and consistent.",
      examples: [
        'Nav: z-index: var(--z-index-1)',
        'Dropdown: z-index: var(--z-index-2)',
        'Modal: z-index: var(--z-index-3)',
        'Drawer: z-index: var(--z-index-3)',
        'Toast: z-index: var(--z-index-4) — transient, highest',
      ],
      rules: [
        'Never use raw numbers like 999 or 9999.',
        'z-index must pair with a proportional shadow.',
        'Drawer and modal both use the same level — drawer can be lower if it has a backdrop.',
        'Transient UI (toasts, snackbars) gets the highest level.',
        'Test z-index in both light and dark modes.',
      ],
    },
    {
      id: 'dark-mode',
      title: 'Elevation in dark mode',
      intro: 'Shadows must adapt, not invert.',
      body: 'Inverting shadows (making them larger or darker) in dark mode usually looks wrong — they can appear as floating blobs or lose contrast. Instead, adjust the shadow color, spread, and opacity while keeping the same level number. The scale numbers stay; only the CSS values shift.',
      examples: [
        'level-1 light: var(--shadow-sm)',
        'level-1 dark: 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'level-2 light: var(--shadow-md)',
        'level-2 dark: 0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        'level-3 light: var(--shadow-lg)',
        'level-3 dark: 0 10px 15px -3px rgba(0, 0, 0, 0.45)',
      ],
      rules: [
        'Keep the level number the same across themes.',
        'Adjust color, spread, and opacity — not the level.',
        'Test shadow readability in both themes.',
        'Avoid inverted shadows (never make them larger/darker in dark mode).',
        'Use color-mix in CSS for smooth transitions between themes.',
      ],
      code: {
        label: 'elevation-dark.css',
        source: elevationDarkCss,
      },
      visuals: [
        {
          title: 'Elevation in dark mode',
          caption: 'Shadows adapt to the dark surface: same level, adjusted contrast.',
          svg: dark_shadow,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying elevation consistently.',
      body: "Start with level-0 as the baseline. Only raise elevation when the visual hierarchy requires it. Use the same shadow scale in CSS and in the design system documentation. Always test in both light and dark modes. Document each level's purpose so teammates know when to reach for which level.",
      rules: [
        'Start with level-0 as the baseline.',
        'Only raise elevation when the hierarchy requires it.',
        'Use the same scale in CSS, documentation, and components.',
        'Always test in both light and dark modes.',
        "Document each level's purpose before shipping.",
        'Never exceed the documented maximum without a codemod and release note.',
      ],
      code: {
        label: 'component-example.tsx',
        source: componentExampleTsx,
      },
      items: [
        {
          title: 'Do',
          body: 'Use level-1 for hovers, level-2 for cards, level-3 for modals. Test in dark mode.',
        },
        {
          title: "Don't",
          body: "Don't use raw z-index numbers. Don't skip levels. Don't forget dark mode adjustments.",
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Verify your elevation implementation.',
      items: [
        {
          title: 'Scale',
          body: 'All 5 levels documented in CSS custom properties. z-index follows the same numeric scale.',
        },
        {
          title: 'Dark mode',
          body: 'Shadows adapt to dark mode without arbitrary changes. Level numbers stay the same.',
        },
        {
          title: 'z-index',
          body: 'z-index references the same scale as shadows. No raw numbers.',
        },
        {
          title: 'Components',
          body: 'Every component uses elevation tokens, not hard-coded shadows.',
        },
      ],
    },
  ],
};
