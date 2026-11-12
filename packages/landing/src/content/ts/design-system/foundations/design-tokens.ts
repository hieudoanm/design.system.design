import type { Topic } from './index';

const tokensTokensJson = `{
  "primitive": {
    "blue": { "600": { "$value": "#1f4fd8", "$type": "color" } },
    "gray": { "900": { "$value": "#111827", "$type": "color" } },
    "space": { "4": { "$value": "16px", "$type": "dimension" } }
  },
  "semantic": {
    "color": {
      "action-bg": { "$value": "{primitive.blue.600}", "$type": "color" },
      "text":     { "$value": "{primitive.gray.900}", "$type": "color" }
    },
    "space": {
      "inline": { "$value": "{primitive.space.4}", "$type": "dimension" }
    }
  }
}`;

const tokensCss = `:root {
  /* primitives — raw values */
  --blue-600: #1f4fd8;
  --gray-900: #111827;
  --space-4: 16px;

  /* semantics — purpose */
  --color-action-bg: var(--blue-600);
  --color-text: var(--gray-900);
  --space-inline: var(--space-4);
}`;

const scriptsBuildTokensMjs = `import StyleDictionary from "style-dictionary";

const sd = new StyleDictionary({
  source: ["tokens/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "packages/ui/src/",
      files: [{ destination: "tokens.css", format: "css/variables" }],
    },
    ts: {
      transformGroup: "js",
      buildPath: "packages/ui/src/",
      files: [{ destination: "tokens.ts", format: "javascript/es6" }],
    },
  },
});

await sd.buildAll();`;

const appGlobalsCss = `:root {
  --color-action-bg: var(--blue-600);
  --color-text: var(--gray-900);
}

[data-theme="dark"] {
  --color-action-bg: #5b86f5;
  --color-text: #f3f4f6;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-action-bg: #5b86f5;
    --color-text: #f3f4f6;
  }
}`;

const tokensCss2 = `:root {
  /* Deprecated in v3 — use --color-action-bg. Removed in v4. */
  --color-primary: var(--color-action-bg);
  --color-action-bg: var(--blue-600);
}`;

export const designTokens: Topic = {
  slug: 'design-tokens',
  title: 'Design tokens',
  tagline: 'The one source of truth for every value that can change.',
  summary:
    'Tokens are named values for colour, type, space, radius, shadow and motion. A component never contains a raw hex code or pixel value; it refers to a token, and changing the token changes everything that uses it.',
  group: 'foundations',
  sections: [
    {
      id: 'layers',
      title: 'Two layers: primitives and semantics',
      intro: 'The distinction that makes theming possible.',
      blocks: [
        {
          type: 'prose',
          text: 'A **primitive token** is a raw value with no opinion about where it is used: `blue-600`, `gray-900`, `space-4`. A **semantic token** names a purpose and points at a primitive: `color-action-bg`, `color-text-muted`, `space-inline`.\n\nComponents only ever reference semantic tokens. That means re-theming is a matter of re-pointing semantics at a different set of primitives, not of editing components. A second brand, a dark mode and a high-contrast mode all fall out of the same mechanism.\n\nKeep the primitive layer out of your application code. If a component can see `--blue-600`, the abstraction has already leaked.',
        },
        {
          type: 'examples',
          examples: [
            'Primitive: `--blue-600: #1f4fd8` — a value, no meaning',
            'Semantic: `--color-action-bg: var(--blue-600)` — a decision',
            'Component: `background: var(--color-action-bg)` — no raw values',
          ],
        },
        {
          type: 'rules',
          rules: [
            'Name semantic tokens by purpose, not by appearance: `color-danger`, not `color-red`.',
            'Never let a semantic token point at a semantic token in another theme file.',
            'Delete a primitive only when no semantic token references it.',
          ],
        },
        {
          type: 'code',
          label: 'tokens/tokens.json',
          source: tokensTokensJson,
        },
      ],
    },
    {
      id: 'naming',
      title: 'Naming',
      intro: 'A token name is a promise to everyone who reads it later.',
      blocks: [
        {
          type: 'prose',
          text: 'Good token names survive a palette change. `color-red` becomes a lie the moment red is replaced by orange, and every consumer who trusted the name has to audit their code. `color-danger` keeps meaning whatever it points at.\n\nThe convention that works is **category → role → variant**, most general first: `color`, `surface`, `border`, `text`, `space`, `font`, `radius`, `shadow`, `duration`, `easing`. Within `color`, roles are `action`, `text`, `surface`, `border`, `feedback`; within a role, variants are `primary`, `subtle`, `strong`, `muted`.\n\nKeep the set small. A scale with forty greys is not a system, it is a palette with commitment issues. If a designer asks for one more step, the answer is usually that one of the existing steps should be reused.',
        },
        {
          type: 'rules',
          rules: [
            'Lowercase, hyphenated, no abbreviations: `color-text-muted`, not `colTxtMut`.',
            'Describe the role, never the value: `space-tight`, not `space-4px`.',
            'A token set is small enough to print on one page.',
            'Do not encode the medium in the name: `border-hairline` is fine, `border-border` is not.',
          ],
        },
        {
          type: 'code',
          label: 'tokens.css',
          source: tokensCss,
        },
      ],
    },
    {
      id: 'distribution',
      title: 'One source, many platforms',
      intro: 'Generate the tokens; never hand-maintain the outputs.',
      blocks: [
        {
          type: 'prose',
          text: 'Keep the source of truth as JSON (or the W3C Design Tokens format) and generate everything else from it: CSS custom properties for the web, a TypeScript module for JavaScript and chart libraries, Swift and Kotlin objects for native, and a Figma plugin payload for design.\n\nThe generated CSS is committed or served, but it is never edited by hand. Hand-edited generated output is how a design system silently forks into four slightly different colour palettes.',
        },
        {
          type: 'rules',
          rules: [
            'One JSON source, generated by a script you can run offline.',
            'Generated files are read-only. If you need a change, change the source and regenerate.',
            'The build fails on an unknown token reference.',
          ],
        },
        {
          type: 'code',
          label: 'scripts/build-tokens.mjs',
          source: scriptsBuildTokensMjs,
        },
      ],
    },
    {
      id: 'theming',
      title: 'Theming and dark mode',
      intro: 'A theme is a different mapping, not a different stylesheet.',
      blocks: [
        {
          type: 'prose',
          text: 'Because components use semantic tokens, a theme is only a new set of semantic-to-primitive bindings. Switching theme means setting one attribute on the root: `data-theme="dark"`. No component changes, no conditional class names, no duplicated CSS.\n\nDefault to the user preference with `prefers-color-scheme` and let them override it — a manual toggle that wins over the system preference, remembered in `localStorage`. When you add a theme, re-check contrast in it: a muted grey that reads well on paper can disappear on a dark surface.',
        },
        {
          type: 'rules',
          rules: [
            'One `data-theme` attribute on `<html>`; no theme-specific classes in components.',
            'Dark mode is a token mapping, not a second set of component styles.',
            'Re-run the contrast check for every theme you ship.',
            'Honour `prefers-reduced-motion` in the theme, not just the component.',
          ],
        },
        {
          type: 'code',
          label: 'app/globals.css',
          source: appGlobalsCss,
        },
      ],
    },
    {
      id: 'migration',
      title: 'Renaming and migrating',
      intro: 'Tokens are an API, and APIs have to be versioned.',
      blocks: [
        {
          type: 'prose',
          text: 'A token rename breaks every consumer, exactly like renaming an exported function. Treat it the way you would treat any public API: ship the new name, keep the old one as an alias for one major version, then delete it in the next major with a codemod and a migration note.\n\nResist the urge to rename for tidiness. A rename with no user-visible benefit costs every downstream team a migration and buys the design system a cleaner file. If the old name is genuinely misleading — it says "red" but points at orange — that is worth doing, and worth doing slowly.',
        },
        {
          type: 'rules',
          rules: [
            'A renamed or removed token is a breaking change: major version, migration guide, codemod.',
            'Alias the old name to the new one for at least one release.',
            'Announce deprecations in the release notes with the date they will be removed.',
            'Track token usage so you know who is affected before you break them.',
          ],
        },
        {
          type: 'code',
          label: 'tokens.css (deprecation)',
          source: tokensCss2,
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before you call the token layer done.',
      blocks: [
        {
          type: 'prose',
          text: 'Run through this list once per theme and once per platform. It is short on purpose.',
        },
        {
          type: 'items',
          items: [
            {
              title: 'No raw values in components',
              body: 'Search the codebase for `#`, `rgb(` and `px`. Outside the token source itself, there should be none.',
            },
            {
              title: 'Every semantic token resolves',
              body: 'Build fails on an unresolved reference; check the generated CSS is complete for every theme.',
            },
            {
              title: 'Contrast holds in every theme',
              body: 'Check text, icons and borders against their actual surfaces, not against the token name.',
            },
            {
              title: 'The set is small',
              body: 'If you cannot explain why a token exists, delete it. Unused tokens are future confusion.',
            },
          ],
        },
      ],
    },
  ],
};
