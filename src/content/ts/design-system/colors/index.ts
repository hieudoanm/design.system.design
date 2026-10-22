import type { Topic } from '../index';
import { palette, contrast, surfaces, semantic, dark_mode } from './svg-generated';

const contrastCheckTs = `function getContrast(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// WCAG AA: >= 4.5 for normal text, >= 3 for large/UI
const passesAA = (ratio: number, isLarge = false) => 
  isLarge ? ratio >= 3 : ratio >= 4.5;`;

const tokensCss = `:root {
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
}`;

export const colors: Topic = {
  slug: 'colors',
  title: 'Colors',
  tagline: 'A systematic approach to color with purpose, contrast, and accessibility.',
  summary:
    'Colors communicate hierarchy, state, and brand identity. A color system uses primitives for raw values and semantics for meaning, ensuring consistent theming, accessibility, and maintainability across light and dark modes.',
  group: 'foundations',
  sections: [
    {
      id: 'philosophy',
      title: 'Color philosophy',
      intro: 'Color should communicate meaning, not just decoration.',
      body: 'Every color in the system has a purpose. Use color to guide attention, indicate state, and establish hierarchy. Avoid using color as the only means of communication — pair it with icons, text, or patterns for accessibility.\n\nThe key principle is to separate what the color is (primitive) from why it is used (semantic). This separation enables theming, dark mode support, and brand flexibility without rewriting components.',
      rules: [
        'Use color to communicate meaning and hierarchy.',
        'Never rely on color alone to convey information.',
        'Separate primitives (raw values) from semantics (purpose).',
        'Design for both light and dark modes from the start.',
      ],
      visuals: [
        {
          title: 'Color system structure',
          caption:
            'Primitives define the available palette, while semantic tokens map those values to meaningful roles used by components.',
          svg: palette,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'primitives',
      title: 'Primitive palette',
      intro: 'The full range of available color values.',
      body: 'Primitives are raw color values with no semantic meaning. They form the foundation of the color system and are referenced by semantic tokens. Keep primitives generic and flexible so they can support multiple themes.\n\nA good primitive palette includes neutrals for text and surfaces, plus a brand color and a full set of feedback colors (success, warning, danger, info). Limit the number of primitives to avoid decision paralysis.',
      examples: [
        'Neutrals: gray-50 through gray-900 for text, surfaces, and borders',
        'Brand: blue-600 as the primary action color',
        'Success: emerald-600 for positive states',
        'Warning: amber-600 for cautionary states',
        'Danger: red-600 for destructive states',
      ],
      rules: [
        'Primitives have no meaning — only values.',
        'Use a numeric scale (50-900) for consistency.',
        'Include enough steps for states (hover, active, disabled).',
        'Keep primitives out of component code.',
      ],
    },
    {
      id: 'semantics',
      title: 'Semantic color roles',
      intro: 'Colors named by their purpose, not their appearance.',
      body: 'Semantic tokens describe how color is used: color-text, color-action-bg, color-surface, color-danger. These names remain valid even if the underlying primitive changes. Components always reference semantic tokens, never primitives directly.\n\nThis indirection is what makes theming possible. When switching to dark mode, you re-map semantics to different primitives without touching a single component.',
      visuals: [
        {
          title: 'Semantic feedback colors',
          caption:
            'Each feedback state has a dedicated color role with matching background tints for non-intrusive messaging.',
          svg: semantic,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      examples: [
        'Text: primary, secondary (muted), disabled',
        'Surfaces: background (paper), default, raised, overlay',
        'Actions: primary, secondary, ghost, destructive',
        'Borders: default, strong, focus',
        'Feedback: success, warning, danger, info',
      ],
      rules: [
        'Name by purpose: color-danger, not color-red.',
        'Components only use semantic tokens.',
        'Each semantic role should have states (default, hover, active, disabled).',
        'Provide background tints for feedback messages.',
      ],
    },
    {
      id: 'surfaces',
      title: 'Surface hierarchy',
      intro: 'Layering creates depth and visual order.',
      body: 'Surfaces are the backgrounds where content sits. A clear hierarchy helps users understand what is foreground vs background. Typically: paper (page background) -> surface (cards, panels) -> surface-raised (modals, dropdowns, popovers).\n\nEach level up should have slightly different treatment — often a subtle background change, border, or shadow. This creates natural elevation without relying solely on shadows.',
      visuals: [
        {
          title: 'Surface layering',
          caption:
            'Content flows through layers: page background, surface containers, and raised overlays create clear visual hierarchy.',
          svg: surfaces,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      rules: [
        'Use consistent surface levels across the application.',
        'Raised surfaces should sit above their containers.',
        'Consider borders or shadows to reinforce elevation.',
        'Maintain sufficient contrast between text and surfaces.',
      ],
    },
    {
      id: 'contrast',
      title: 'Contrast & accessibility',
      intro: 'Readable color combinations are non-negotiable.',
      body: 'WCAG 2.2 AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18.66px bold or 24px regular). UI components like buttons, icons, and focus indicators need 3:1 against adjacent colors.\n\nAlways check contrast in both light and dark modes. Automated testing in CI catches regressions before they reach users. Remember: color alone must never convey critical information.',
      visuals: [
        {
          title: 'Contrast ratio examples',
          caption:
            'Examples of passing and failing contrast combinations with their calculated ratios.',
          svg: contrast,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      examples: [
        'Body text on white: #111827 achieves high contrast',
        'Muted text needs careful selection: aim for >=4.5:1 when used alone',
        'Primary buttons on white: ensure background meets 3:1 for the button itself',
        'Focus indicators need 3:1 against the background',
      ],
      rules: [
        'Normal text: minimum 4.5:1 contrast ratio.',
        'Large text (>=24px or >=18.66px bold): minimum 3:1.',
        'UI components and graphics: minimum 3:1.',
        'Test all color pairings in every theme.',
        'Never use color alone to indicate state or status.',
      ],
      code: {
        label: 'contrast-check.ts',
        source: contrastCheckTs,
      },
    },
    {
      id: 'theming',
      title: 'Theming & dark mode',
      intro: 'One system, multiple themes.',
      body: 'Themes are just different mappings of semantic tokens to primitive values. Switching themes means changing those mappings, not rewriting components. Use data-theme on the root element and respect prefers-color-scheme for automatic detection.\n\nIn dark mode, you typically need higher contrast, desaturated brand colors, and adjusted surface colors. Avoid simply inverting colors — carefully re-select primitives for optimal readability in low-light environments.',
      visuals: [
        {
          title: 'Light and dark theme mapping',
          caption: 'The same semantic tokens map to different primitive values in each theme.',
          svg: dark_mode,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      rules: [
        'Use data-theme="dark" attribute on <html>.',
        'Respect prefers-color-scheme as the default.',
        'Store user preference in localStorage.',
        'Dark mode is token remapping, not component duplication.',
        'Re-verify contrast ratios in dark mode.',
        'Consider prefers-contrast and forced-colors modes.',
      ],
      code: {
        label: 'tokens.css',
        source: tokensCss,
      },
    },
    {
      id: 'usage',
      title: 'Usage guidelines',
      intro: 'Practical rules for applying colors.',
      body: 'Follow these guidelines to maintain consistency and accessibility across your product. When in doubt, favor semantic meaning over aesthetic preference.',
      rules: [
        'Use the action color sparingly for primary calls-to-action.',
        'Use neutral colors for most text and UI chrome.',
        'Reserve feedback colors for their specific states.',
        'Ensure disabled states have reduced opacity but remain distinguishable.',
        'Avoid using brand colors for error states.',
        'Test in grayscale to verify hierarchy without color.',
        'Consider color blindness — use patterns/shapes as backups.',
      ],
      items: [
        {
          title: 'Do',
          body: 'Use color-text-muted for secondary information. Use semantic feedback colors with appropriate backgrounds. Test contrast for all combinations.',
        },
        {
          title: "Don't",
          body: "Don't use hex values directly in components. Don't rely solely on red for errors without other indicators. Don't use too many colors in one view.",
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Verify your color implementation.',
      items: [
        {
          title: 'Tokens',
          body: 'All colors use semantic tokens. No hard-coded hex values in components. Primitives are only referenced by semantics.',
        },
        {
          title: 'Accessibility',
          body: 'All text meets contrast requirements. UI elements meet 3:1. Information not conveyed by color alone. Tested with color blindness simulators.',
        },
        {
          title: 'Theming',
          body: 'Works in light mode. Works in dark mode. Respects system preferences. Theme persists across sessions.',
        },
        {
          title: 'States',
          body: 'Hover, active, focus, disabled states defined. States maintain accessibility. Focus indicators are visible.',
        },
      ],
    },
  ],
};
