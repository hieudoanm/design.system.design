import type { Topic } from '../../index';

const logicalPropsMd = `\`\`\`css
/* Physical — breaks in RTL */
.card {
  margin-left: 16px;
  padding-right: 24px;
  border-top: 1px solid var(--color-rule);
}

/* Logical — works in LTR and RTL */
.card {
  margin-inline-start: 16px;
  padding-inline-end: 24px;
  border-block-start: 1px solid var(--color-rule);
}
\`\`\``;

const rtlLayoutMd = `\`\`\`css
/* Root RTL switch */
:root {
  --direction: ltr;
}
[dir="rtl"] {
  --direction: rtl;
}

.layout {
  display: flex;
  flex-direction: row; /* logical: inline */
}
/* In RTL, flex children automatically reverse */
\`\`\``;

const mirroredIconsMd = `\`\`\`tsx
function Icon({ name, mirrored = false }: IconProps) {
  const dir = useDirection(); // from context
  const shouldMirror = mirrored && dir === 'rtl';
  return (
    <svg style={{ transform: shouldMirror ? 'scaleX(-1)' : 'none' }}>
      <use href={\`#icon-\${name}\`} />
    </svg>
  );
}
\`\`\``;

const textHandlingMd = `\`\`\`css
:root {
  --font-latin: 'Inter', system-ui, sans-serif;
  --font-arabic: 'Noto Sans Arabic', 'Amiri', system-ui;
  --font-hebrew: 'Noto Sans Hebrew', 'David', system-ui;
  --font-devanagari: 'Noto Sans Devanagari', 'Hind', system-ui;
}
body {
  font-family: var(--font-latin), var(--font-arabic), var(--font-hebrew), var(--font-devanagari);
}
\`\`\`

\`\`\`ts
new Intl.NumberFormat('ar-EG').format(1234); // "١٬٢٣٤"
\`\`\``;

const localeFormattingMd = `\`\`\`ts
// Hard-coded US format
const date = \`\${month}/\${day}/\${year}\`;
const price = \`$\${amount.toFixed(2)}\`;

// Locale-aware
const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(dateObj);
const price = new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day'); // "yesterday"
\`\`\`

\`\`\`ts
const rules = new Intl.PluralRules(locale);
rules.select(0); // 'zero' in Arabic, 'other' in English
rules.select(1); // 'one'
rules.select(2); // 'two' in Arabic, 'other' in English
\`\`\``;

const i18nChecklistMd = `# I18n/RTL checklist

Before shipping a feature:
- [ ] All spacing uses logical properties (\`margin-inline-start\`, not \`margin-left\`)
- [ ] Layout tested in \`dir="rtl"\` (flip \`<html dir="rtl" />\` in dev tools)
- [ ] Icons tagged as mirrored/non-mirrored; \`Icon\` component handles flip
- [ ] Text alignment uses \`start\`/\`end\` (not \`left\`/\`right\`)
- [ ] Font stack includes fallbacks for all supported scripts
- [ ] Dates, numbers, currencies formatted via \`Intl\` with user locale
- [ ] Pluralization handled via \`Intl.PluralRules\` or i18n library
- [ ] Bidi text tested with mixed LTR/RTL content
- [ ] Eastern Arabic numerals used for Arabic locales
- [ ] RTL language QA pass (Arabic, Hebrew, Persian, Urdu) before release

**Supported locales (example)**: en, es, fr, de, ja, zh-CN, zh-TW, ko, ar, he, fa, ur, hi, pt-BR`;

export const i18n: Topic = {
  slug: 'i18n',
  title: 'Internationalization & RTL',
  tagline: 'Logical properties, mirrored icons, bidi text, and locale-aware formatting.',
  summary:
    'Internationalization is not a translation layer — it is a layout, typography, and data formatting concern that touches every component. This chapter covers the patterns that make a design system work in 20+ languages and both writing directions: logical CSS properties, RTL layout flipping, icon mirroring rules, bidi text handling, font fallbacks, and `Intl`-based formatting for dates, numbers, currencies, and plurals.',
  group: 'specialized',
  sections: [
    {
      id: 'logical-properties',
      title: 'Logical CSS properties',
      intro: 'Write CSS once; it works in LTR and RTL.',
      body: "Physical properties (`margin-left`, `padding-right`, `border-top`, `left`, `right`) assume a writing direction. Logical properties (`margin-inline-start`, `padding-inline-end`, `border-block-start`, `inset-inline-start`, `inset-inline-end`) map to the correct physical side based on the element's `direction` and `writing-mode`. In LTR, `inline-start` = left; in RTL, `inline-start` = right. This single change makes your entire spacing, border, and positioning system bidirectional.",
      rules: [
        'Never use `left`, `right`, `margin-left`, `margin-right`, `padding-left`, `padding-right`.',
        'Use `inline-start`, `inline-end`, `block-start`, `block-end` for all spacing/positioning.',
        'Use `border-inline-start`, `border-inline-end` for borders.',
        'Use `text-align: start` / `end` (not `left`/`right`).',
        'Use `float: inline-start` / `inline-end` (avoid float; prefer flex/grid).',
      ],
      code: {
        label: 'globals.css (logical)',
        source: logicalPropsMd,
      },
    },
    {
      id: 'rtl-layout',
      title: 'RTL layout patterns',
      intro: 'Flex and grid reverse automatically; you handle the exceptions.',
      body: 'Setting `dir="rtl"` on `<html>` (or a subtree) flips the default flow direction. Flexbox and CSS Grid children automatically reverse order (`flex-direction: row` becomes right-to-left). Most layouts "just work" — but exceptions need attention: absolute positioning (`inset-inline-start`), transforms, custom scrollbars, and third-party components that hard-code directions.',
      rules: [
        'Test every page with `<html dir="rtl">` in dev.',
        'Flex/Grid: children reverse automatically — no code change needed.',
        'Absolute positioning: use `inset-inline-start` / `inset-inline-end`.',
        'Transforms: `translateX` flips sign in RTL — use logical or conditional logic.',
        'Third-party components: wrap with `dir="ltr"` if they don\'t support RTL.',
      ],
      code: {
        label: 'patterns/rtl-layout.css',
        source: rtlLayoutMd,
      },
    },
    {
      id: 'icons',
      title: 'Icon mirroring',
      intro: 'Directional icons flip; universal icons do not.',
      body: 'Not every icon should mirror in RTL. Directional icons (chevrons, arrows, back/next, carousel controls, progress direction) must flip. Universal icons (home, user, settings, search, heart, star, brand logos, checkmarks, close X) must not. The safest approach: tag each icon in the registry with `mirrored: boolean`, and let the `Icon` component apply `transform: scaleX(-1)` automatically when `dir="rtl"`.',
      rules: [
        'Registry: every icon has `mirrored: true` (directional) or `false` (universal).',
        'Icon component reads `dir` from context and applies `scaleX(-1)` when needed.',
        'Test every icon in both directions.',
        'Never mirror: logos, hearts, stars, user, home, search, checkmark, close.',
        'Always mirror: chevrons, arrows, back/forward, carousel prev/next, progress.',
      ],
      code: {
        label: 'components/Icon.tsx (mirroring)',
        source: mirroredIconsMd,
      },
    },
    {
      id: 'text-bidi',
      title: 'Bidi text & font fallbacks',
      intro: 'Mixed LTR/RTL content needs explicit control.',
      body: 'Real-world content mixes scripts: Arabic UI with English product names, Hebrew with numbers, Japanese with Latin acronyms. The Unicode Bidirectional Algorithm handles most cases, but you need explicit controls for edge cases: `unicode-bidi: isolate` on user-generated content, `direction: rtl` on RTL-only containers. Font fallback chains must include fonts for every supported script — a missing glyph shows as ☐ (tofu).',
      rules: [
        'Wrap user content in `unicode-bidi: isolate`.',
        'Define font stacks per script: Latin, Arabic, Hebrew, Devanagari, CJK, etc.',
        'Use `font-family` fallback chain: Latin first, then script-specific fonts.',
        'Test with real mixed-content strings (e.g., "iPhone 15 Pro سعر").',
      ],
      code: {
        label: 'globals.css (font-fallbacks)',
        source: textHandlingMd,
      },
    },
    {
      id: 'formatting',
      title: 'Locale-aware formatting',
      intro: 'Never hard-code date, number, or currency formats.',
      body: 'Every locale has its own conventions for dates (DD/MM/YYYY vs MM/DD/YYYY vs YYYY/MM/DD), numbers (1,234.56 vs 1.234,56 vs 1 234,56), currencies ($1,234.56 vs 1.234,56 € vs ¥1,234), and relative time ("yesterday" vs "ayer" vs "أمس"). The `Intl` API handles all of this — pass the user\'s locale and the desired style.',
      rules: [
        'Dates: `Intl.DateTimeFormat(locale, { dateStyle: "medium" })`.',
        'Numbers: `Intl.NumberFormat(locale)`.',
        'Currencies: `Intl.NumberFormat(locale, { style: "currency", currency })`.',
        'Relative time: `Intl.RelativeTimeFormat(locale, { numeric: "auto" })`.',
        'Plurals: `Intl.PluralRules(locale).select(n)` — handle all plural categories.',
        'Never concatenate formatted pieces — format the whole message at once.',
      ],
      code: {
        label: 'lib/format.ts',
        source: localeFormattingMd,
      },
    },
    {
      id: 'checklist',
      title: 'I18n/RTL checklist',
      intro: 'Before shipping a feature.',
      code: {
        label: 'CHECKLIST.md',
        source: i18nChecklistMd,
      },
      items: [
        {
          title: 'Logical properties',
          body: 'All spacing/borders/positioning uses inline-start/end, block-start/end. No left/right.',
        },
        {
          title: 'RTL layout test',
          body: 'Every page tested with <html dir="rtl">. Flex/Grid auto-reverse works. Exceptions handled.',
        },
        {
          title: 'Icon mirroring',
          body: 'Registry tags mirrored/non-mirrored. Icon component auto-flips in RTL.',
        },
        {
          title: 'Text alignment',
          body: 'start/end used everywhere. No text-align: left/right.',
        },
        {
          title: 'Font fallbacks',
          body: 'Font stack includes Arabic, Hebrew, Devanagari, CJK fallbacks. No tofu.',
        },
        {
          title: 'Intl formatting',
          body: 'Dates, numbers, currencies, relative time use Intl with user locale.',
        },
        {
          title: 'Pluralization',
          body: 'Intl.PluralRules or i18n library handles all plural categories per locale.',
        },
        {
          title: 'Bidi testing',
          body: 'Mixed LTR/RTL content tested. unicode-bidi: isolate on user content.',
        },
        {
          title: 'Numerals',
          body: 'Eastern Arabic numerals for ar/fa/ur locales via Intl.NumberFormat.',
        },
        {
          title: 'RTL QA pass',
          body: 'Arabic, Hebrew, Persian, Urdu QA pass before release.',
        },
      ],
    },
  ],
};
