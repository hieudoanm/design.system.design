import type { Topic } from './index';

export const fonts: Topic = {
  slug: 'fonts',
  title: 'Fonts',
  tagline: 'Type, self-hosted, with a scale you can actually hold in your head.',
  summary:
    'Typography is the loudest part of a design system and the part teams most often get wrong. A small set of roles, a modular scale and a self-hosted variable font gets you most of the way there.',
  sections: [
    {
      id: 'families',
      title: 'Two families, one job each',
      intro: 'A text face and a code face. That is the whole brief.',
      body: 'This site uses **Bricolage Grotesque** for everything a person reads and **JetBrains Mono** for anything a machine wrote. That pairing is a template, not a law: pick one text family with enough weights and one monospace family for code, data and identifiers.\n\nLimit yourself to two. Every additional family costs you a licence, a download, a decision at every design review, and a mismatch you have to explain. If you need a third, it should be for a genuinely different purpose — a display face for a marketing page, a serif for long-form reading — and it should live in a separate theme, not in the core.',
      rules: [
        'One text family, one monospace family.',
        'Self-host the font files. Do not call a third-party CDN at runtime.',
        'Ship the variable font; fall back to static weights only if you must.',
        'Declare a metric-compatible fallback so the layout does not shift.',
      ],
      code: {
        label: 'app/layout.tsx',
        source: `import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/jetbrains-mono";

/* globals.css */
@theme {
  --font-sans: "Bricolage Grotesque Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace;
}`,
      },
    },
    {
      id: 'scale',
      title: 'A scale with roles, not sizes',
      intro: 'Name the role, derive the size.',
      body: 'Name type tokens by what they are for — `text-body`, `text-heading`, `text-caption` — and let the scale live underneath. A role-based scale survives a redesign: you change what `text-heading` means and every heading on the product changes with it, because nobody wrote `24px` anywhere.\n\nPick a ratio and stick to it. A modular scale on a 16px base with a 1.25 ratio gives you 12, 14, 16, 20, 25, 31, 39 and 49 — enough steps for almost any interface, and few enough that people remember them.',
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
      id: 'weights',
      title: 'Weights and measure',
      intro: 'Two weights, a readable line length, and nothing else.',
      body: 'Most interfaces need exactly two weights: regular for body copy and a semibold or bold for headings and emphasis. A third weight that is used twice is decoration; a fourth is noise.\n\nLine length matters as much as size. Somewhere between 45 and 75 characters per line is comfortable for body text; past that, the eye loses its place on the return sweep. Constrain prose with a `max-width` in `ch` units and leave the rest of the page full width.',
      rules: [
        'Two weights: 400 for body, 600 for emphasis and headings.',
        'Body text is never below 16px. Below that, cap it at metadata.',
        'Constrain prose to 45–75 characters per line with `max-width: 65ch`.',
        'Line height 1.5 for body copy, 1.1 to 1.25 for headings.',
        'Never set letter spacing below 0 on body text; tighten it only for large display type.',
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
  href="/fonts/bricolage-grotesque-latin.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

/* Metric-matched fallback */
@font-face {
  font-family: "Bricolage Grotesque Fallback";
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
        'Do not communicate meaning through font weight alone.',
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
