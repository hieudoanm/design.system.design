import type { Topic } from '../../index';

const perceptualUniformityMd = `# Perceptual uniformity

Traditional colour spaces (sRGB, HSL) are not perceptually uniform — equal numerical steps do not look equally different to the human eye. OKLCH and Oklab fix this by modelling human vision directly.

| Space | Lightness axis | Chroma axis | Hue axis | Perceptually uniform? |
|-------|----------------|-------------|----------|----------------------|
| sRGB  | —              | —           | —        | No                   |
| HSL   | Lightness      | Saturation  | Hue      | No (lightness lies)  |
| OKLCH | L (0–1)        | C (0–0.4+)  | H (0–360)| **Yes**              |
| Oklab | L (0–1)        | a/b         | —        | **Yes**              |

Use OKLCH for design tokens: \`oklch(60% 0.15 250)\` gives you a predictable blue that scales linearly in lightness and chroma.`;

const gamutMappingMd = `# Gamut mapping & P3

Wide-gamut displays (Display P3, Rec.2020) can show colours outside sRGB. When a token specifies a P3 colour, map it into the target gamut without clipping abruptly — use chroma reduction along constant hue/lightness.

\`\`\`css
/* sRGB fallback, P3 enhancement */
:root {
  --color-brand: #1f4fd8;                    /* sRGB */
}
@media (color-gamut: p3) {
  :root {
    --color-brand: color(display-p3 0.12 0.31 0.87); /* richer blue */
  }
}
\`\`\``;

const colourBlindMd = `# Colour-blind-safe palettes

~8% of men and ~0.5% of women have some form of colour vision deficiency (CVD). The most common is deuteranopia (green-blind) and protanopia (red-blind).

**Safe pairs** (distinguishable by all CVD types):
- Blue / Orange
- Blue / Red
- Yellow / Blue
- White / Black

**Unsafe pairs** (confused by CVD):
- Red / Green
- Green / Brown
- Blue / Purple
- Pink / Grey

**Rule**: never rely on hue alone for status. Pair colour with shape, icon, or text label — see the Accessibility chapter.`;

const tokenArchitectureMd = `# Token architecture for colour science

A colour token is not a hex string — it is a structured object: \`{ space: "oklch", L: 0.6, C: 0.15, H: 250, name: "brand" }\`. From this single source you generate: CSS custom properties (sRGB + P3), iOS SwiftUI colors, Android XML, Figma tokens (JSON), design documentation. The build pipeline handles gamut mapping, contrast checking, and CVD simulation automatically.

**Rule**: store tokens in a platform-agnostic format (OKLCH + metadata).
Generate all platform outputs from the single source.
Validate contrast and CVD safety in CI on every change.

Examples:
- JSON token file → CSS vars + Swift + Compose + Figma JSON
- CI fails if new token drops below 4.5:1 on any background`;

export const colorScience: Topic = {
  slug: 'color-science',
  title: 'Color science & perception',
  tagline: 'Perceptual uniformity, gamut mapping, and colour-blind safety.',
  summary:
    'Colour is not just aesthetics — it is a technical medium with perceptual, hardware, and accessibility constraints. This chapter covers the science behind trustworthy colour systems: perceptually uniform colour spaces (OKLCH/Oklab), wide-gamut support (P3/Rec.2020), colour-blind-safe palettes, and the token architecture that makes it all maintainable.',
  group: 'specialized',
  sections: [
    {
      id: 'perceptual-uniformity',
      title: 'Perceptually uniform colour spaces',
      intro: 'Why HSL lies and OKLCH tells the truth.',
      body: 'HSL and HSV were designed for 1970s graphics hardware, not human vision. Their "lightness" axis does not match perceived brightness — a yellow and a blue at HSL lightness 50% look radically different in brightness. OKLCH (and its Cartesian sibling Oklab) was derived from modern colour appearance models (CAM16) and is perceptually uniform: equal steps in L, C, or H look equally different.',
      rules: [
        'Author tokens in OKLCH, not HSL or RGB.',
        'Use L for lightness, C for chroma (saturation), H for hue.',
        'Convert to sRGB/P3 at build time for browser compatibility.',
      ],
      code: {
        label: 'tokens/color.oklch.ts',
        source: perceptualUniformityMd,
      },
    },
    {
      id: 'gamut',
      title: 'Wide gamut & P3',
      intro: 'Design for the display the user actually has.',
      body: 'Modern phones, laptops, and monitors support Display P3 (≈25% larger than sRGB). If you only author in sRGB, you leave colour on the table. Use the `color-gamut` media query to enhance — not replace — your tokens for wide-gamut screens. The fallback chain is: sRGB token → P3 enhancement → Rec.2020 (future).',
      rules: [
        'Define every brand/accent token in sRGB first.',
        'Add `@media (color-gamut: p3)` overrides for richer variants.',
        'Never hard-code P3 values without an sRGB fallback.',
      ],
      code: {
        label: 'globals.css (gamut)',
        source: gamutMappingMd,
      },
    },
    {
      id: 'cvd',
      title: 'Colour-blind-safe palettes',
      intro: 'If it fails for deuteranopia, it fails for your users.',
      body: 'Colour vision deficiency affects ~1 in 12 men. The most common types (deuteranopia, protanopia) confuse red/green/brown. The safest strategy: never encode meaning in hue alone. Use redundant encoding — colour + icon, colour + text, colour + pattern. For data visualisation, use CVD-safe categorical palettes (e.g., viridis, cividis, or hand-tuned blue/orange/yellow sets).',
      rules: [
        'Never use red/green as the only distinction.',
        'Test every palette with a CVD simulator (Stark, Color Oracle).',
        'Provide a CVD-safe variant for every categorical palette.',
      ],
      code: {
        label: 'palettes/cvd-safe.ts',
        source: colourBlindMd,
      },
    },
    {
      id: 'token-architecture',
      title: 'Token architecture for colour science',
      intro: 'One source of truth, multiple output formats.',
      body: 'A colour token is not a hex string — it is a structured object: `{ space: "oklch", L: 0.6, C: 0.15, H: 250, name: "brand" }`. From this single source you generate: CSS custom properties (sRGB + P3), iOS SwiftUI colors, Android XML, Figma tokens (JSON), design documentation. The build pipeline handles gamut mapping, contrast checking, and CVD simulation automatically.',
      rules: [
        'Store tokens in a platform-agnostic format (OKLCH + metadata).',
        'Generate all platform outputs from the single source.',
        'Validate contrast and CVD safety in CI on every change.',
      ],
      examples: [
        'JSON token file → CSS vars + Swift + Compose + Figma JSON',
        'CI fails if new token drops below 4.5:1 on any background',
      ],
      code: {
        label: 'pipeline/token-pipeline.ts',
        source: tokenArchitectureMd,
      },
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping a colour system.',
      items: [
        {
          title: 'Perceptual uniformity',
          body: 'All tokens authored in OKLCH. Lightness steps are visually equal.',
        },
        {
          title: 'Gamut support',
          body: 'sRGB fallbacks exist. P3 enhancements via @media (color-gamut: p3).',
        },
        {
          title: 'CVD safety',
          body: 'No meaning conveyed by hue alone. Palettes tested in simulator.',
        },
        {
          title: 'Contrast validation',
          body: 'Every token pair checked for 4.5:1 (text) / 3:1 (UI) in CI.',
        },
        {
          title: 'Token pipeline',
          body: 'Single JSON source generates CSS, iOS, Android, Figma, docs.',
        },
      ],
    },
  ],
};
