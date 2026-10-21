import type { Topic } from './index';

/*
 * The specimens below are drawn with the font stacks a reader's machine
 * already has, so the page shows what the reader actually sees. The stack
 * falls back, exactly as a web page falls back when a font is missing.
 */

const PANGRAM = 'The quick brown fox jumps over the lazy dog';

const specimens = [
  {
    name: 'Arial',
    category: 'Sans · neo-grotesque',
    stack: `Arial, "Helvetica Neue", Helvetica, sans-serif`,
  },
  {
    name: 'Helvetica',
    category: 'Sans · neo-grotesque',
    stack: `Helvetica, "Helvetica Neue", Arial, sans-serif`,
  },
  {
    name: 'Georgia',
    category: 'Serif · transitional',
    stack: `Georgia, "Times New Roman", serif`,
  },
  {
    name: 'Times New Roman',
    category: 'Serif · transitional',
    stack: `"Times New Roman", Times, serif`,
  },
  {
    name: 'Verdana',
    category: 'Sans · wide, made for screens',
    stack: `Verdana, Geneva, "DejaVu Sans", sans-serif`,
  },
  {
    name: 'Trebuchet MS',
    category: 'Sans · humanist',
    stack: `"Trebuchet MS", Tahoma, Geneva, sans-serif`,
  },
  {
    name: 'Courier New',
    category: 'Mono · slab serif',
    stack: `"Courier New", Courier, monospace`,
  },
  {
    name: 'Impact',
    category: 'Display · condensed',
    stack: `Impact, Haettenschweiler, "Arial Narrow", sans-serif`,
  },
  {
    name: 'Comic Sans MS',
    category: 'Informal · handwritten',
    stack: `"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive`,
  },
];

const svg = (title: string, id: string, viewBox: string, body: string) =>
  [
    `<svg viewBox='${viewBox}' width='100%' role='img' aria-labelledby='${id}' xmlns='http://www.w3.org/2000/svg'>`,
    `<title id='${id}'>${title}</title>`,
    body,
    `</svg>`,
  ].join('\n');

/* --- anatomy ------------------------------------------------------------- */

const anatomy = svg(
  'Diagram of the anatomy of a typeface, showing the cap height, the x-height, the baseline, the descender and a counter',
  'font-anatomy-title',
  '0 0 560 300',
  [
    `<g style='font-family:Georgia, "Times New Roman", serif;fill:var(--color-ink)' font-size='150'>`,
    `<text x='30' y='230'>H</text>`,
    `<text x='170' y='230'>x</text>`,
    `<text x='250' y='230'>o</text>`,
    `</g>`,
    `<g style='stroke:var(--color-mute)' stroke-width='1' stroke-dasharray='4 4'>`,
    `<line x1='16' y1='123' x2='350' y2='123' />`,
    `<line x1='16' y1='151' x2='350' y2='151' />`,
    `<line x1='16' y1='230' x2='350' y2='230' />`,
    `<line x1='16' y1='261' x2='350' y2='261' />`,
    `</g>`,
    `<g style='stroke:var(--color-mute)' stroke-width='1'>`,
    `<line x1='350' y1='123' x2='434' y2='123' />`,
    `<line x1='350' y1='151' x2='434' y2='151' />`,
    `<line x1='350' y1='230' x2='434' y2='230' />`,
    `<line x1='350' y1='261' x2='434' y2='261' />`,
    `</g>`,
    `<g style='fill:var(--color-ink)' font-size='12'>`,
    `<text x='440' y='127'>Cap height</text>`,
    `<text x='440' y='155'>x-height</text>`,
    `<text x='440' y='234'>Baseline</text>`,
    `<text x='440' y='265'>Descender</text>`,
    `</g>`,
    `<circle cx='295' cy='188' r='7' fill='none' style='stroke:var(--color-marker)' stroke-width='1.5' />`,
    `<line x1='303' y1='188' x2='356' y2='188' style='stroke:var(--color-marker)' stroke-width='1' />`,
    `<text x='362' y='192' font-size='12' style='fill:var(--color-marker)'>Counter</text>`,
    `<text x='16' y='28' font-size='12' style='fill:var(--color-mute)'>Georgia, 150px</text>`,
  ].join('\n'),
);

/* --- scale ---------------------------------------------------------------- */

const scaleRows = [
  { token: 'text-caption', size: 12, ratio: '12 / 1.4', baseline: 28 },
  { token: 'text-body', size: 16, ratio: '16 / 1.6', baseline: 60 },
  { token: 'text-lead', size: 20, ratio: '20 / 1.5', baseline: 96 },
  { token: 'text-heading', size: 31, ratio: '31 / 1.2', baseline: 142 },
  { token: 'text-display', size: 49, ratio: '49 / 1.05', baseline: 202 },
];

const scale = svg(
  'A five-step type scale, from a 12 pixel caption to a 49 pixel display size',
  'font-scale-title',
  '0 0 560 230',
  [
    `<g style='font-family:var(--font-sans);fill:var(--color-ink)'>`,
    scaleRows
      .map((row) => `<text x='170' y='${row.baseline}' font-size='${row.size}'>Typography</text>`)
      .join(''),
    `</g>`,
    `<g style='font-family:var(--font-mono);fill:var(--color-mute)' font-size='10'>`,
    scaleRows
      .map((row) => `<text x='16' y='${row.baseline}'>${row.token} · ${row.ratio}</text>`)
      .join(''),
    `</g>`,
  ].join('\n'),
);

/* --- measure -------------------------------------------------------------- */

const narrowLines = [
  'Typography is the craft',
  'of arranging language so',
  'that it can be read with',
  'ease, and found again by',
  'anyone who needs it, and',
  'not hunted for. That is',
  'the whole of the job, and',
  'it is worth doing well.',
];

const wideLines = [
  'Typography is the craft of arranging language so that it can be read with',
  'ease, and found again by anyone who needs it, without hunting for it at all.',
  'A type system is a set of decisions made once — about size, weight, colour',
  'and space — and then applied everywhere, so that every screen speaks in the',
  'same voice and at the same size, which is harder than it sounds and worth a',
  'great deal more when it actually works than when it almost works. Measure',
  'is the width of the column, and the column is the single cheapest way to',
  'make a page comfortable to read. Keep the line between 45 and 75 characters.',
];

const measure = svg(
  'Two columns of the same text, one too narrow at 28 characters per line and one comfortable at 60',
  'font-measure-title',
  '0 0 660 230',
  [
    `<text x='40' y='30' font-size='12' font-weight='600' style='fill:var(--color-ink)'>Too narrow · 28 characters</text>`,
    `<g style='fill:var(--color-mute)' font-size='10'>`,
    narrowLines.map((line, i) => `<text x='40' y='${56 + i * 16}'>${line}</text>`).join(''),
    `</g>`,
    `<text x='258' y='30' font-size='12' font-weight='600' style='fill:var(--color-ink)'>Comfortable · 60 characters</text>`,
    `<g style='fill:var(--color-mute)' font-size='10'>`,
    wideLines.map((line, i) => `<text x='258' y='${60 + i * 16}'>${line}</text>`).join(''),
    `</g>`,
    `<g style='stroke:var(--color-marker)' stroke-width='1'>`,
    `<line x1='246' y1='48' x2='246' y2='180' />`,
    `<line x1='246' y1='48' x2='252' y2='48' />`,
    `<line x1='246' y1='180' x2='252' y2='180' />`,
    `</g>`,
    `<text x='238' y='114' font-size='11' text-anchor='middle' transform='rotate(-90 238 114)' style='fill:var(--color-marker)'>45–75 characters</text>`,
    `<text x='40' y='212' font-size='11' style='fill:var(--color-mute)'>Same words, same size. Only the width of the column changed.</text>`,
  ].join('\n'),
);

/* --- specimens ------------------------------------------------------------ */

const specimenRows = specimens
  .map((specimen, i) => {
    const baseline = 56 + i * 44;
    return [
      `<g style='font-family:${specimen.stack}'>`,
      `<text x='24' y='${baseline}' font-size='34' style='fill:var(--color-ink)'>Aa</text>`,
      `</g>`,
      `<text x='80' y='${baseline - 6}' font-size='12' font-weight='600' style='fill:var(--color-ink)'>${specimen.name}</text>`,
      `<text x='80' y='${baseline + 10}' font-size='10' style='fill:var(--color-mute)'>${specimen.category}</text>`,
      `<text x='190' y='${baseline + 2}' font-size='17' style='font-family:${specimen.stack};fill:var(--color-ink)'>${PANGRAM}</text>`,
      `<line x1='24' y1='${baseline + 24}' x2='656' y2='${baseline + 24}' style='stroke:var(--color-rule)' stroke-width='1' />`,
    ].join('');
  })
  .join('\n');

const specimensSvg = svg(
  'Type specimens of the most widely installed fonts, each showing the alphabet and the pangram The quick brown fox jumps over the lazy dog',
  'font-specimens-title',
  '0 0 680 440',
  [
    `<g style='font-family:var(--font-mono);fill:var(--color-mute)' font-size='10' letter-spacing='1'>`,
    `<text x='80' y='26'>Family</text>`,
    `<text x='190' y='26'>Specimen · 44 characters</text>`,
    `</g>`,
    `<line x1='24' y1='34' x2='656' y2='34' style='stroke:var(--color-rule)' stroke-width='1' />`,
    specimenRows,
  ].join('\n'),
);

export const fonts: Topic = {
  slug: 'fonts',
  title: 'Typography',
  tagline:
    'Type as a system: families, a scale, a measure — and the most popular fonts in the world.',
  summary:
    'Typography is the loudest part of a design system and the part teams most often get wrong. A small set of roles, a modular scale, a readable measure and one or two well-chosen families get you most of the way there.',
  sections: [
    {
      id: 'typography',
      title: 'What typography is',
      intro: 'A typeface is a design. A font is the file that carries it.',
      body: 'Typography is the craft of setting type so that language can be read with ease and found again when someone needs it. It is not decoration, and it is not a mood board — it is a set of measurable decisions about size, weight, colour, spacing and rhythm.\n\nThe vocabulary is small and worth learning, because it is how you describe what is wrong. A **typeface** is a design; a **font** is the file, the licence and the weights you shipped. Type is classified by its most visible trait — the serifs, the strokes, the proportions — and every classification trades one thing for another.',
      items: [
        {
          title: 'Serif',
          body: 'A small finishing stroke at the end of a character. Transitional, Didone and slab serifs behave very differently at small sizes.',
        },
        {
          title: 'Sans-serif',
          body: 'No finishing stroke. Grotesque, humanist and geometric families each give a different texture to a paragraph.',
        },
        {
          title: 'Monospace',
          body: 'Every character the same width. Built for code, tables and anything that must line up in columns.',
        },
        {
          title: 'Display',
          body: 'Drawn to be looked at rather than read: condensed, high-contrast, or expressive. Use it once per page, at a size.',
        },
      ],
      visuals: [
        {
          title: 'The anatomy of a typeface',
          caption:
            'Four measurements describe almost every letter: the cap height, the x-height, the baseline and the descender. Two families with the same point size can look very different, because their x-heights are not the same — which is why "set it in Georgia" does not mean "set it a little smaller".',
          svg: anatomy,
          full: true,
          minWidth: 420,
          maxWidth: 620,
        },
      ],
      rules: [
        'Compare families by x-height, not by point size.',
        'A typeface is a design; a font is the file, the weights and the licence.',
        'Set the same sentence in every candidate before you decide.',
      ],
    },
    {
      id: 'families',
      title: 'Choosing a family',
      intro: 'One for reading, one for code, and a reason for anything else.',
      body: 'Most products need exactly two families: a text face for everything a person reads, and a monospace face for anything a machine wrote — code, identifiers, tables of numbers that must line up. That pairing is a template, not a law.\n\nLimit yourself to two. Every additional family costs you a licence, a download, a decision at every design review, and a mismatch you have to explain. If you need a third, it should be for a genuinely different purpose — a display face for a marketing page, a serif for long-form reading — and it should live in a separate theme, not in the core.\n\nA family is only as good as the weights you ship. Check that it has a real 400 and a real 600, that the italic is drawn rather than slanted, and that the numbers have the widths you need.',
      rules: [
        'One text family, one monospace family.',
        'Self-host the font files. Do not call a third-party CDN at runtime.',
        'Ship the variable font; fall back to static weights only if you must.',
        'Declare a metric-compatible fallback so the layout does not shift.',
        'Check the family at 12px before you check it at 72px.',
      ],
      code: {
        label: 'app/globals.css',
        source: `@theme {
  /* the stack is a contract: the first family that exists wins */
  --font-sans: "Your Text Family", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Your Mono Family", ui-monospace, SFMono-Regular, Menlo, monospace;
}

body {
  font-family: var(--font-sans);
}`,
      },
    },
    {
      id: 'popular',
      title: 'The most popular fonts',
      intro: 'The pangram, set in every family — and why the answer is usually "none of them".',
      body: 'Every specimen below is the same pangram, set in a family that is already installed on the machine you are reading this on. That is the point: these are the fonts that arrive by default, and they are what your interface looks like on every device where nobody chose a typeface.\n\nThe pangram earns its place because it shows the whole alphabet in one line — every letter, in ascending and descending pairs, in a word that happens to mean nothing. Set it in a new family and you learn more in a second than from a specimen sheet.\n\nNone of these is a good choice for a new product. They are popular because they are free and everywhere, not because they are beautiful. But they are worth knowing, because when you *do* pick one — for a prototype, for a print piece, for a machine with no fonts — it is these you will get.',
      visuals: [
        {
          title: 'Specimens — the pangram in nine families',
          caption:
            'Each row is the same 44 characters, so the differences you see are the differences between the letters themselves. Where a family is missing, the stack falls back — which is exactly what a web page does when it asks for a font it has not shipped.',
          svg: specimensSvg,
          full: true,
          minWidth: 520,
          maxWidth: 760,
        },
        {
          title: 'The popular web fonts',
          caption:
            'The families most often downloaded and self-hosted today. All of them are open licence, all of them need a webfont, and none of them is installed on the reader’s machine by default — which is exactly why the specimens above are the ones your users already have.',
          full: true,
          table: {
            columns: ['Family', 'Category', 'Why it is common', 'Licence'],
            rows: [
              [
                'Inter',
                'Sans · neo-grotesque',
                'The default interface face of the web; huge x-height, tabular figures',
                'OFL',
              ],
              [
                'Roboto',
                'Sans · neo-grotesque',
                'Android’s system face and the voice of Material Design',
                'OFL',
              ],
              [
                'Open Sans',
                'Sans · humanist',
                'For years the default of WordPress themes and Bootstrap',
                'OFL',
              ],
              [
                'Lato',
                'Sans · humanist',
                'Warm and round; everywhere in marketing and documentation',
                'OFL',
              ],
              [
                'Montserrat',
                'Sans · geometric',
                'A display face used for headings, logos and dashboards',
                'OFL',
              ],
              [
                'Poppins',
                'Sans · geometric',
                'Round, friendly and unfussy; popular in product UI',
                'OFL',
              ],
              [
                'Source Serif 4',
                'Serif · transitional',
                'Long-form reading, where a serif earns its download',
                'OFL',
              ],
              [
                'IBM Plex Sans',
                'Sans · grotesque',
                'A family with matching serif and mono, for institutions',
                'OFL',
              ],
            ],
          },
        },
      ],
      rules: [
        'Judge a family on a sentence, never on its capital A.',
        'Always specify a fallback stack — a missing font must not mean missing text.',
        'Never name a font in CSS that you have not shipped or cannot guarantee.',
      ],
    },
    {
      id: 'scale',
      title: 'A scale with roles, not sizes',
      intro: 'Name the role, derive the size.',
      body: 'Name type tokens by what they are for — `text-body`, `text-heading`, `text-caption` — and let the scale live underneath. A role-based scale survives a redesign: you change what `text-heading` means and every heading on the product changes with it, because nobody wrote `24px` anywhere.\n\nPick a ratio and stick to it. A modular scale on a 16px base with a 1.25 ratio gives you 12, 14, 16, 20, 25, 31, 39 and 49 — enough steps for almost any interface, and few enough that people remember them.',
      visuals: [
        {
          title: 'A five-step scale',
          caption:
            'Five steps, named by role. Everything on a screen should be one of them — a sixth size is a new decision, not a new need.',
          svg: scale,
          full: true,
          minWidth: 420,
          maxWidth: 620,
        },
      ],
      examples: [
        '`text-caption` — 12px / 1.4 — metadata, table headers, timestamps',
        '`text-body` — 16px / 1.6 — paragraphs and most UI copy',
        '`text-lead` — 20px / 1.5 — intros and standfirsts',
        '`text-heading` — 31px / 1.2 — section headings',
        '`text-display` — 49px / 1.05 — page titles and hero copy',
      ],
      rules: [
        'Tokens are named by role (`text-body`), never by size (`text-16`).',
        'Use a modular scale with a ratio around 1.2 to 1.25.',
        'Fewer than eight steps. If you need a ninth, you need a smaller scale.',
        'Line height is part of the token, not a value you retype per component.',
      ],
      code: {
        label: 'app/globals.css',
        source: `@theme {
  --text-caption: 0.75rem;
  --text-caption--line-height: 1.4;
  --text-body: 1rem;
  --text-body--line-height: 1.6;
  --text-lead: 1.25rem;
  --text-lead--line-height: 1.5;
  --text-heading: 1.9375rem;
  --text-heading--line-height: 1.2;
  --text-display: 3.0625rem;
  --text-display--line-height: 1.05;
}`,
      },
    },
    {
      id: 'measure',
      title: 'Measure and leading',
      intro: 'The width of the line matters as much as the size of the letters.',
      body: 'Somewhere between 45 and 75 characters per line is comfortable for body text. Past 75 the eye loses its place on the return sweep and has to hunt for the start of the next line; below 45 it reads as a list of fragments. Constrain prose with a `max-width` in `ch` units and leave the rest of the page full width — full-width paragraphs are not a style, they are a bug.\n\nLeading is the space between the lines, and it has to grow as the type gets bigger. Body copy wants 1.5 to 1.6; a 49px heading wants 1.05. Set both in the token, because the number that is right for one is wrong for the other.',
      visuals: [
        {
          title: 'Two columns, same words',
          caption:
            'The left column is too narrow and breaks every phrase in the wrong place. The right one holds the line between 45 and 75 characters. Nothing else differs.',
          svg: measure,
          full: true,
          minWidth: 520,
          maxWidth: 720,
        },
      ],
      rules: [
        'Constrain prose to 45–75 characters per line with `max-width: 65ch`.',
        'Line height 1.5 for body copy, 1.1 to 1.25 for headings.',
        'Never set a paragraph wider than its container allows by accident.',
        'Give a pull quote a narrower measure than the body around it.',
      ],
      code: {
        label: 'prose.css',
        source: `.prose {
  max-width: 65ch;
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
  font-weight: 400;
}

.prose h2 {
  font-size: var(--text-heading);
  line-height: var(--text-heading--line-height);
  font-weight: 600;
  letter-spacing: -0.01em;
}`,
      },
    },
    {
      id: 'weights',
      title: 'Weight and hierarchy',
      intro: 'Two weights, and the size does the rest.',
      body: 'Most interfaces need exactly two weights: regular for body copy and a semibold or bold for headings and emphasis. A third weight that is used twice is decoration; a fourth is noise. Hierarchy comes first from size, then from weight, then from colour — and only then from a typeface that looks different.\n\nThe same applies to size: the gap between your body text and your headings should be obvious without anyone having to think about it. If the reader can tell a heading from a paragraph at a glance, the hierarchy is doing its job; if they have to check the size, it is not.',
      rules: [
        'Two weights: 400 for body, 600 for emphasis and headings.',
        'Body text is never below 16px. Below that, cap it at metadata.',
        'Let size carry the hierarchy before weight does.',
        'Never set letter spacing below 0 on body text; tighten it only for large display type.',
        'Do not communicate meaning through font weight alone.',
      ],
    },
    {
      id: 'loading',
      title: 'Loading without a flash',
      intro: 'The first paint is a design decision.',
      body: 'A web font that arrives late replaces your text with an invisible box, then with a different-looking font, then with the real one. That is three layouts and a visible jump. The fix is to preload the font file, declare `font-display: swap`, and give the fallback similar metrics so the swap is a subtle change rather than a reflow.\n\nSelf-hosting also removes a third-party request from your critical path, which improves the metric users actually feel and keeps the page working when the CDN does not.',
      rules: [
        'Preload the one or two font files used above the fold.',
        'Use `font-display: swap` so text is never invisible.',
        'Match the fallback metrics with `size-adjust`, `ascent-override` and `descent-override`.',
        'Subset to the languages you serve. Latin is a fraction of the full file.',
      ],
      code: {
        label: 'app/layout.tsx',
        source: `<link
  rel="preload"
  href="/fonts/your-text-family-latin.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

/* Metric-matched fallback */
@font-face {
  font-family: "Your Text Family Fallback";
  src: local("Arial");
  size-adjust: 103%;
  ascent-override: 96%;
  descent-override: 24%;
}`,
      },
    },
    {
      id: 'accessibility',
      title: 'Typography and accessibility',
      intro: 'Type is where most accessibility wins and losses happen.',
      body: 'Legibility is a hard requirement, not a preference. Body text at 16px in a 400 weight with 1.6 line height is a good baseline; thin weights below that size are the first thing to fail in low light.\n\nUsers can and do change their own font size. Never set a fixed `height` on a text container, never clip text with `overflow: hidden`, and never use `text-transform: uppercase` on anything longer than a few words — it destroys the shape of the word for screen reader users and for anyone with dyslexia.',
      rules: [
        'Body text at least 16px, weight 400 or heavier.',
        'Respect the user zoom; never cap the page scale.',
        'Do not set a fixed height on anything containing text.',
        'Avoid `text-transform: uppercase` on sentences.',
        'Check contrast for every colour you set type in, not just the default.',
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Five minutes, once per new screen.',
      items: [
        {
          title: 'No orphan sizes',
          body: 'Every piece of text on the screen uses a token from the scale. No `text-[15px]` in the diff.',
        },
        {
          title: 'Line length is bounded',
          body: 'Long-form copy sits in a 65ch column. Full-width paragraphs are a bug.',
        },
        {
          title: 'It survives 200% zoom',
          body: 'Zoom the page to 200% and check nothing is clipped, overlapped or cut off.',
        },
        {
          title: 'It survives the fallback',
          body: 'Block the font file and confirm the page still reads and still lays out.',
        },
        {
          title: 'It loads once',
          body: 'Two families, one preloaded file each, and nothing fetched from a third party.',
        },
      ],
    },
  ],
};
