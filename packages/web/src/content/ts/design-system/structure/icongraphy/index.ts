import type { Topic } from '../../index';

/*
 * Icon system: modular SVG files imported from generated module.
 * Run `node scripts/ts/generate-svg.mts icons` to regenerate svg-generated.ts
 * when SVG files in ./svg/ are added or modified.
 */

import {
  anatomy,
  home_filled,
  home_outline,
  home_sharp,
  home_twotone,
  grid_home,
  grid_search,
  grid_user,
  grid_settings,
  grid_mail,
  grid_bell,
  grid_folder,
  grid_download,
  grid_upload,
  grid_trash,
  grid_edit,
  grid_eye,
  grid_star,
} from './svg-generated';

const appGlobalsCss = `@theme {
  --icon-xs: 16px;
  --icon-sm: 20px;
  --icon-md: 24px;
  --icon-lg: 32px;
  --icon-xl: 48px;
}

.icon { width: var(--icon-md); height: var(--icon-md); }
.icon-sm { width: var(--icon-sm); height: var(--icon-sm); }
.icon-lg { width: var(--icon-lg); height: var(--icon-lg); }`;

const componentsIconTsx = `export function Icon({
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
<Icon name="chevron-down" aria-hidden="true" /> // next to "Sort" text`;

const componentsIconsRegistryTs = `// Generated from SVG files at build time — do not edit by hand
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
}`;

/* --- sizing tokens ------------------------------------------------------- */

const sizingTable = {
  columns: ['Token', 'Size', 'Use case'],
  rows: [
    ['--icon-xs', '16px', 'Inline with caption text, dense tables'],
    ['--icon-sm', '20px', 'Inline with body text, button icons'],
    ['--icon-md', '24px', 'Default: toolbar, navigation, card actions'],
    ['--icon-lg', '32px', 'Feature callouts, empty states'],
    ['--icon-xl', '48px', 'Hero illustrations, onboarding steps'],
  ],
};

/* --- accessibility table ------------------------------------------------- */

const a11yTable = {
  columns: ['Scenario', 'Implementation'],
  rows: [
    ['Decorative icon', 'aria-hidden="true" + no visible label needed'],
    ['Standalone icon button', 'aria-label="Action name" on button'],
    ['Icon with visible label', 'aria-hidden="true" on icon, label in text'],
    ['Icon as status indicator', 'role="img" + aria-label with state'],
    ['Animated icon', 'respect prefers-reduced-motion'],
  ],
};

/* --- style variants ------------------------------------------------------ */

const styleVariants = [
  {
    name: 'Outline (default)',
    body: '2px stroke, no fill. The standard style for toolbar and inline icons.',
    svg: home_outline,
  },
  {
    name: 'Filled',
    body: 'Solid fill, no stroke. Used for high-emphasis actions and tab bar selected states.',
    svg: home_filled,
  },
  {
    name: 'Two-tone',
    body: 'Primary stroke with secondary fill at 40% opacity. For complex icons needing visual hierarchy.',
    svg: home_twotone,
  },
  {
    name: 'Sharp',
    body: 'Sharp corners, 2px stroke. For technical or developer-focused interfaces.',
    svg: home_sharp,
  },
];

/* --- icon grid ----------------------------------------------------------- */

const gridIcons = [
  {
    name: 'Home',
    svg: grid_home,
  },
  {
    name: 'Search',
    svg: grid_search,
  },
  {
    name: 'User',
    svg: grid_user,
  },
  {
    name: 'Settings',
    svg: grid_settings,
  },
  {
    name: 'Mail',
    svg: grid_mail,
  },
  {
    name: 'Bell',
    svg: grid_bell,
  },
  {
    name: 'Folder',
    svg: grid_folder,
  },
  {
    name: 'Download',
    svg: grid_download,
  },
  {
    name: 'Upload',
    svg: grid_upload,
  },
  {
    name: 'Trash',
    svg: grid_trash,
  },
  {
    name: 'Edit',
    svg: grid_edit,
  },
  {
    name: 'Eye',
    svg: grid_eye,
  },
  {
    name: 'Star',
    svg: grid_star,
  },
].map((icon) => ({
  title: `Grid icon: ${icon.name}`,
  caption: `Core icon: ${icon.name}`,
  svg: icon.svg,
  minWidth: 200,
  maxWidth: 300,
}));

export const icongraphy: Topic = {
  slug: 'icongraphy',
  title: 'Iconography',
  tagline: 'A coherent icon system: grid, style, sizing, and accessibility.',
  summary:
    'Icons are the visual vocabulary of an interface. A consistent system — fixed grid, unified stroke, optical alignment, and clear semantics — makes icons feel like part of the same family, not a collected set.',
  group: 'structure',
  sections: [
    {
      id: 'principles',
      title: 'Principles',
      intro: 'The rules that keep the set coherent.',
      items: [
        {
          title: 'One grid, one stroke',
          body: 'Every icon is drawn on a 24×24 grid with a 2px stroke. No exceptions. This ensures visual weight is consistent whether the icon sits alone or next to text.',
        },
        {
          title: 'Optical alignment over mathematical',
          body: 'Center the visual weight, not the bounding box. A triangle points up but its mass sits lower — nudge it up. A speech bubble has its tail — shift the bubble so the whole form feels centered.',
        },
        {
          title: 'Metaphors from the platform, not the brand',
          body: 'Use the metaphors users already know: magnifier for search, gear for settings, trash for delete. Novel metaphors cost learning time; standard ones are invisible in a good way.',
        },
        {
          title: 'Style follows function',
          body: 'Outline for default, filled for selected/active, two-tone for hierarchy, sharp for developer tools. Each style has a semantic purpose, not just aesthetic preference.',
        },
      ],
      rules: [
        'Never mix stroke weights in the same view.',
        'Never scale an icon non-uniformly — it distorts the stroke.',
        'Reserve filled style for selected states and high-emphasis actions.',
        'Keep the icon set under 200 glyphs. Beyond that, it is a library, not a system.',
      ],
    },
    {
      id: 'anatomy',
      title: 'Anatomy of a system icon',
      intro: 'Every icon shares the same construction.',
      visuals: [
        {
          title: 'The 24×24 grid',
          caption:
            'A 2px padding (safe zone) inside the 24×24 viewBox. The 2px stroke sits on the 2px/22px lines. Optical center marked at 12,12 — but actual center of mass may differ.',
          svg: anatomy,
          minWidth: 200,
          maxWidth: 300,
        },
      ],
      body: 'The grid is the contract. Every glyph — whether a simple home or a complex settings gear — lives inside the same 24×24 viewBox with a 2px safe zone. The stroke is always 2px, always centered on the pixel grid. This means a 24px icon rendered at 24px has crisp, pixel-perfect edges.',
    },
    {
      id: 'styles',
      title: 'Style variants',
      intro: 'Four styles, each with a semantic role.',
      visuals: styleVariants.map((v) => ({
        title: v.name,
        caption: v.body,
        svg: v.svg,
        minWidth: 200,
        maxWidth: 300,
      })),
      rules: [
        'Outline is the default — use it everywhere unless another style is semantically required.',
        'Filled = selected/active state (tab bar, toggle on). Never mix filled and outline in the same control group.',
        'Two-tone reserved for complex icons where a single stroke cannot express hierarchy (e.g., cloud with sync arrows).',
        'Sharp is opt-in for developer-facing surfaces only.',
      ],
    },
    {
      id: 'grid',
      title: 'Core icon set',
      intro: 'The 12 icons every interface needs. Extend from here, but start with these.',
      visuals: gridIcons,
      rules: [
        'Name icons by metaphor, not by feature: "search", not "header-search".',
        'Add new icons only when an existing metaphor genuinely does not fit.',
        'Run new icons through the grid check: stroke 2px? safe zone respected? optical center aligned?',
      ],
    },
    {
      id: 'sizing',
      title: 'Sizing tokens',
      intro: 'Size icons with tokens, not pixels. The token maps to a context, not a pixel value.',
      code: {
        label: 'app/globals.css',
        source: appGlobalsCss,
      },
      visuals: [
        {
          title: 'Sizing tokens',
          caption: 'Icon size tokens mapped to use cases.',
          table: sizingTable,
        },
      ],
      rules: [
        'Icon size always matches the text size it sits next to: 16px text → 16px icon, 24px heading → 24px icon.',
        'Never hard-code icon dimensions in components. Use the token.',
        'The token system allows a global scale change (e.g., compact mode) without touching components.',
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      intro: 'Icons are invisible to screen readers unless you make them visible.',
      code: {
        label: 'components/Icon.tsx',
        source: componentsIconTsx,
      },
      visuals: [
        {
          title: 'Accessibility patterns',
          caption: 'How to make icons accessible in different scenarios.',
          table: a11yTable,
        },
      ],
      rules: [
        'Decorative icons: aria-hidden="true". The screen reader ignores them.',
        'Standalone icon buttons: aria-label on the button with the action name.',
        'Icon + text label: aria-hidden="true" on the icon, let the text speak.',
        'Status icons (error, success, loading): role="img" + aria-label describing the state.',
        'Animated icons (spinners): respect prefers-reduced-motion, provide text alternative.',
      ],
      body: 'For the full accessibility strategy (WCAG 2.2 AA baseline, keyboard, semantics, motion, testing), see the <a href="/design-system/accessibility">Accessibility</a> chapter.',
    },
    {
      id: 'implementation',
      title: 'Implementation',
      intro: 'A single registry, a single component, tree-shakeable.',
      code: {
        label: 'components/icons/registry.ts',
        source: componentsIconsRegistryTs,
      },
      rules: [
        'Store source SVGs in /icons/src, generate registry at build.',
        'Tree-shaking: only imported icons end up in the bundle.',
        'No runtime SVG parsing — the registry is pure React nodes.',
        'TypeScript keys: the registry keys are the only valid icon names.',
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping a new icon.',
      items: [
        {
          title: 'Grid conformance',
          body: '24×24 viewBox, 2px stroke, 2px safe zone, centered on pixel grid.',
        },
        {
          title: 'Optical alignment',
          body: 'Visual center matches 12,12. Nudge if the metaphor pulls weight off-center.',
        },
        {
          title: 'Style correctness',
          body: 'Outline by default. Filled only for selected states. Two-tone only when needed.',
        },
        {
          title: 'Accessibility',
          body: 'Has a clear semantic name. Works with aria-label and aria-hidden patterns.',
        },
        {
          title: 'Token sizing',
          body: 'Renders correctly at --icon-xs through --icon-xl without stroke distortion.',
        },
      ],
    },
  ],
};
