import type { Topic } from '../index';

/*
 * The type drawings below are plain SVG. They live in ./svg as files and are
 * exposed by the generated module ./svg-generated — run
 * `node scripts/ts/generate-svg.mts fonts` to regenerate it after editing one.
 *
 * The specimens are drawn with the font stacks a reader’s machine already
 * has, so the page shows what the reader actually sees. The stack falls back,
 * exactly as a web page falls back when a font is missing.
 */

import { anatomy, measure, scale, specimens } from './svg-generated';

const appGlobalsCss = `@theme {
  /* the stack is a contract: the first family that exists wins */
  --font-sans: "Your Text Family", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Your Mono Family", ui-monospace, SFMono-Regular, Menlo, monospace;
}

body {
  font-family: var(--font-sans);
}`;

const appGlobalsCss2 = `@theme {
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
}`;

const proseCss = `.prose {
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
}`;

const appLayoutTsx = `<link
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
}`;

export const typography: Topic = {
  slug: 'typography',
  title: 'Typography',
  tagline:
    'Type as a system: families, a scale, a measure — and the most popular fonts in the world.',
  summary:
    'Typography is the loudest part of a design system and the part teams most often get wrong. A small set of roles, a modular scale, a readable measure and one or two well-chosen families get you most of the way there.',
  group: 'foundations',
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
        source: appGlobalsCss,
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
          svg: specimens,
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
        source: appGlobalsCss2,
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
        source: proseCss,
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
        source: appLayoutTsx,
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
