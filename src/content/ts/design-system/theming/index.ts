import type { Topic } from '../index';

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

const appGlobalsCss = `@media (prefers-color-scheme: dark) {
  :root {
    --color-paper: #0f172a;
    --color-surface: #111827;
    --color-text: #f3f4f6;
    --color-action-bg: #5b86f5;
  }
}`;

const accessibleThemeCss = `@media (forced-colors: active) {
  :root {
    /* Forced colors override custom properties */
    --color-text: CanvasText;
    --color-surface: Canvas;
  }
}`;

export const theming: Topic = {
  slug: 'theming',
  title: 'Theming & dark mode',
  tagline: 'One system, multiple themes.',
  summary:
    'Themes are just different mappings of semantic tokens to primitive values. Switching themes means changing those mappings, not rewriting components. Use `data-theme` on the root element and respect `prefers-color-scheme` for automatic detection.',
  group: 'practice',
  sections: [
    {
      id: 'philosophy',
      title: 'Theming philosophy',
      intro: 'A theme is a different mapping, not a different stylesheet.',
      body: 'Because components use semantic tokens, a theme is only a new set of semantic-to-primitive bindings. Switching theme means setting one attribute on the root: `data-theme="dark"`. No component changes, no conditional class names, no duplicated CSS.\n\nDefault to the user preference with `prefers-color-scheme` and let them override it — a manual toggle that wins over the system preference, remembered in `localStorage`. When you add a theme, re-check contrast in it: a muted grey that reads well on paper can disappear on a dark surface.',
      rules: [
        'One `data-theme` attribute on `<html>`; no theme-specific classes in components.',
        'Dark mode is a token mapping, not a second set of component styles.',
        'Re-run the contrast check for every theme you ship.',
        'Honour `prefers-reduced-motion` in the theme, not just the component.',
      ],
      visuals: [
        {
          title: 'Light and dark theme mapping',
          caption: 'The same semantic tokens map to different primitive values in each theme.',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Theme Mapping</text><rect x="60" y="70" width="120" height="80" rx="8" fill="var(--color-surface)" stroke="var(--color-rule)" stroke-width="1"/><text x="120" y="95" font-size="9" fill="var(--color-ink)">--color-paper: #fff</text><text x="120" y="110" font-size="9" fill="var(--color-ink)">--color-surface: #f9fafb</text><text x="60" y="170" font-size="9" fill="var(--color-mute)">Dark</text><rect x="60" y="140" width="120" height="40" rx="8" fill="var(--color-surface)" stroke="var(--color-rule)" stroke-width="1" opacity="0.3"/><text x="120" y="165" font-size="9" fill="var(--color-ink)">--color-paper: #0f172a</text><text x="120" y="185" font-size="9" fill="var(--color-ink)">--color-surface: #111827</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'token-mapping',
      title: 'Token mapping',
      intro: 'How primitives map to semantic tokens.',
      body: 'Each semantic token maps to one or more primitive values. In light mode, `color-action-bg` might map to `blue-600`. In dark mode, it maps to a different blue that provides equivalent contrast. The mapping is defined in the CSS using `:root` and `[data-theme="dark"]` selectors.',
      examples: [
        '`color-action-bg: var(--blue-600)` in light mode',
        '`--color-action-bg: #5b86f5` in dark mode',
        '`color-text: var(--gray-900)` in light mode',
        '`--color-text: #f3f4f6` in dark mode',
      ],
      code: {
        label: 'tokens.css',
        source: tokensCss,
      },
    },
    {
      id: 'media-query',
      title: 'prefers-color-scheme',
      intro: "Respect the user's system preference.",
      body: "Use `prefers-color-scheme` as the default theme. This respects the user's system-wide light/dark preference. Store the user's manual override in `localStorage` so it persists across sessions.\n\nThe media query trick is to declare both light and dark token sets and let the user's system preference decide which one to use, while still allowing manual overrides.",
      examples: [
        '`@media (prefers-color-scheme: dark) { :root { ...dark tokens ... } }`',
        'User manually sets `data-theme="light"` via a toggle',
        'JavaScript detects the toggle and sets `data-theme` accordingly',
      ],
      rules: [
        'Use `prefers-color-scheme` as the default, not a hard-coded light theme.',
        'Store user preference in `localStorage`.',
        'Allow manual override of the system preference.',
        'Test that both light and dark modes work with the system preference.',
        'Honour `forced-colors` media query for accessibility modes.',
      ],
      code: {
        label: 'app/globals.css',
        source: appGlobalsCss,
      },
    },
    {
      id: 'accessibility',
      title: 'Accessibility & high contrast',
      intro: 'Themes must work in all accessibility modes.',
      body: 'High contrast modes can override CSS custom properties. Test your themes in forced-colors mode (`@media (forced-colors: active)`). Never rely on color alone to convey meaning — use the token system to ensure sufficient contrast in all modes.\n\nA theme should be usable by people with visual impairments, including those who rely on forced-colors mode or screen readers.',
      rules: [
        'Test themes in forced-colors mode.',
        'Never use color alone to convey meaning.',
        'Ensure all text meets contrast ratios in all themes.',
        'Provide skip links and landmark regions.',
        'Use the token system — never hard-coded hex values.',
      ],
      code: {
        label: 'accessible-theme.css',
        source: accessibleThemeCss,
      },
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying theming consistently.',
      body: 'Start with light mode, then add dark mode. Use the token system so you only need to re-map primitives, not rewrite components. Test in both modes, including forced-colors. Provide a manual toggle that persists in localStorage.',
      rules: [
        'Start with light mode, then add dark mode.',
        'Use the token system — never hard-code hex values in components.',
        'Test in both light and dark modes, including forced-colors.',
        'Provide a manual toggle that persists in localStorage.',
        'Re-verify contrast ratios when adding a new theme.',
      ],
      items: [
        {
          title: 'Do',
          body: 'Use semantic tokens. Test in forced-colors. Provide a persistent toggle.',
        },
        {
          title: "Don't",
          body: 'Do not hard-code hex values. Do not skip forced-colors testing.',
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Before shipping your theming system.',
      items: [
        {
          title: 'Tokens',
          body: 'All colors use semantic tokens. No hard-coded hex values in components. Tokens are defined for both light and dark modes.',
        },
        {
          title: 'Accessibility',
          body: 'Contrast ratios met in light and dark modes. Tested in forced-colors mode.',
        },
        {
          title: 'Theming',
          body: 'Works in light mode. Works in dark mode. Respects system preferences. Theme persists across sessions.',
        },
      ],
    },
  ],
};
