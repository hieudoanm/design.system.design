import type { Topic } from './index';

/*
 * The device frames below are drawn from the same little vocabulary: a body,
 * a screen, blocks for content and a colour for each accent. Every frame is
 * the same page at a different width.
 */

const block = (x: number, y: number, w: number, h: number, opacity = 0.07, rx = 4) =>
  `<rect x='${x}' y='${y}' width='${w}' height='${h}' rx='${rx}' style='fill:var(--color-ink)' fill-opacity='${opacity}' />`;

const accent = (x: number, y: number, w: number, h: number, colour: string, rx = 2) =>
  `<rect x='${x}' y='${y}' width='${w}' height='${h}' rx='${rx}' style='fill:${colour}' />`;

const frame = (x: number, y: number, w: number, h: number, rx: number) =>
  [
    `<rect x='${x}' y='${y}' width='${w}' height='${h}' rx='${rx}' style='fill:var(--color-ink)' />`,
    `<rect x='${x + 4}' y='${y + 4}' width='${w - 8}' height='${h - 8}' rx='${Math.max(rx - 4, 2)}' style='fill:var(--color-paper)' />`,
  ].join('');

/** A dimension line with ticks and a label, drawn under a device. */
const dimension = (x: number, y: number, w: number, label: string) =>
  [
    `<g style='stroke:var(--color-mute)' stroke-width='1'>`,
    `<line x1='${x}' y1='${y}' x2='${x + w}' y2='${y}' />`,
    `<line x1='${x}' y1='${y - 5}' x2='${x}' y2='${y + 5}' />`,
    `<line x1='${x + w}' y1='${y - 5}' x2='${x + w}' y2='${y + 5}' />`,
    `</g>`,
    `<text x='${x + w / 2}' y='${y + 17}' font-size='11' text-anchor='middle' style='fill:var(--color-mute)'>${label}</text>`,
  ].join('');

/** A chip is a small labelled pill used to annotate a frame. */
const chip = (label: string, x: number, y: number) => {
  const w = Math.round(label.length * 6) + 18;
  return [
    `<rect x='${x}' y='${y}' width='${w}' height='22' rx='11' style='fill:var(--color-ink)' fill-opacity='0.06' />`,
    `<text x='${x + 9}' y='${y + 15}' font-size='11' style='fill:var(--color-ink)'>${label}</text>`,
  ].join('');
};

const chips = (labels: string[], x: number, y: number, maxWidth: number) => {
  let cx = x;
  let cy = y;
  const out: string[] = [];
  for (const label of labels) {
    const w = Math.round(label.length * 6) + 18;
    if (cx > x && cx + w > x + maxWidth) {
      cx = x;
      cy += 28;
    }
    out.push(chip(label, cx, cy));
    cx += w + 8;
  }
  return out.join('');
};

const svg = (title: string, id: string, body: string) =>
  [
    `<svg viewBox='0 0 480 340' width='100%' role='img' aria-labelledby='${id}' xmlns='http://www.w3.org/2000/svg'>`,
    `<title id='${id}'>${title}</title>`,
    body,
    `</svg>`,
  ].join('\n');

/* --- mobile ------------------------------------------------------------- */

const mobile = svg(
  'Wireframe of a mobile layout at 360 by 740 pixels: one column, a bottom tab bar and large touch targets',
  'screen-mobile-title',
  [
    frame(67, 28, 126, 259, 14),
    block(73, 40, 106, 16, 0.1),
    accent(77, 45, 14, 6, 'var(--color-cobalt)'),
    accent(73, 64, 106, 12, 'var(--color-marker)', 4),
    [86, 116, 146]
      .map(
        (y) =>
          block(73, y, 106, 24) +
          block(77, y + 7, 10, 10, 0.25, 2) +
          block(93, y + 6, 58, 4, 0.25, 2) +
          block(93, y + 14, 38, 4, 0.15, 2),
      )
      .join(''),
    `<circle cx='169' cy='240' r='11' style='fill:var(--color-marker)' />`,
    block(73, 250, 106, 26, 0.08, 6),
    accent(81, 258, 10, 10, 'var(--color-cobalt)', 3),
    [106, 131, 156].map((x) => block(x, 258, 10, 10, 0.3, 3)).join(''),
    dimension(67, 298, 126, '360 px'),
    `<text x='250' y='52' font-size='15' font-weight='600' style='fill:var(--color-ink)'>360 × 740</text>`,
    `<text x='250' y='72' font-size='11' style='fill:var(--color-mute)'>Phones, portrait</text>`,
    chips(['One column', 'Bottom tab bar', '44px targets', 'Full-bleed media'], 250, 96, 210),
  ].join('\n'),
);

/* --- tablet -------------------------------------------------------------- */

const tablet = svg(
  'Wireframe of a tablet layout at 768 by 1024 pixels: two columns of cards and a permanent navigation rail',
  'screen-tablet-title',
  [
    frame(34, 28, 192, 256, 12),
    block(40, 38, 180, 18, 0.1),
    accent(44, 44, 16, 6, 'var(--color-cobalt)'),
    block(40, 62, 44, 212, 0.07),
    accent(46, 70, 32, 5, 'var(--color-cobalt)'),
    [88, 104, 120].map((y) => block(46, y, 32, 5, 0.28, 2)).join(''),
    [96, 161]
      .map((x) =>
        [62, 116, 170]
          .map(
            (y) =>
              block(x, y, 57, 46) +
              accent(x, y, 57, 5, x === 96 ? 'var(--color-cobalt)' : 'var(--color-marker)', 2),
          )
          .join(''),
      )
      .join(''),
    dimension(34, 296, 192, '768 px'),
    `<text x='250' y='52' font-size='15' font-weight='600' style='fill:var(--color-ink)'>768 × 1024</text>`,
    `<text x='250' y='72' font-size='11' style='fill:var(--color-mute)'>Tablets, portrait and landscape</text>`,
    chips(['Two columns', 'Nav rail', 'Split view', 'Pointer or touch'], 250, 96, 210),
  ].join('\n'),
);

/* --- laptop -------------------------------------------------------------- */

const laptop = svg(
  'Wireframe of a laptop layout at 1280 by 800 pixels: three columns of cards, a permanent sidebar and a top navigation',
  'screen-laptop-title',
  [
    frame(90, 30, 300, 187, 8),
    `<rect x='74' y='221' width='332' height='8' rx='4' style='fill:var(--color-ink)' fill-opacity='0.45' />`,
    block(100, 40, 280, 18, 0.1),
    accent(104, 46, 16, 6, 'var(--color-cobalt)'),
    [290, 316, 342].map((x) => block(x, 47, 20, 5, 0.25, 2)).join(''),
    block(100, 64, 58, 143, 0.07),
    accent(106, 72, 32, 5, 'var(--color-cobalt)'),
    [88, 104, 120].map((y) => block(106, y, 32, 5, 0.28, 2)).join(''),
    [166, 240, 314]
      .map((x) =>
        [64, 138]
          .map(
            (y) =>
              block(x, y, 65, 66) +
              accent(x, y, 65, 5, x === 166 ? 'var(--color-cobalt)' : 'var(--color-marker)', 2),
          )
          .join(''),
      )
      .join(''),
    dimension(90, 244, 300, '1280 px'),
    `<text x='90' y='292' font-size='15' font-weight='600' style='fill:var(--color-ink)'>1280 × 800</text>`,
    chips(
      ['Three columns', 'Permanent sidebar', 'Hover and focus', 'Keyboard first'],
      90,
      302,
      390,
    ),
  ].join('\n'),
);

/* --- desktop ------------------------------------------------------------- */

const desktop = svg(
  'Wireframe of a desktop layout at 1920 by 1080 pixels: four columns of cards and a second level of navigation',
  'screen-desktop-title',
  [
    frame(90, 44, 300, 169, 6),
    block(100, 54, 280, 18, 0.1),
    accent(104, 60, 16, 6, 'var(--color-cobalt)'),
    [286, 312, 338].map((x) => block(x, 61, 20, 5, 0.25, 2)).join(''),
    block(100, 78, 66, 125, 0.07),
    accent(106, 86, 32, 5, 'var(--color-cobalt)'),
    [102, 118, 134].map((y) => block(106, y, 32, 5, 0.28, 2)).join(''),
    [174, 227, 280, 333]
      .map((x) =>
        [78, 144]
          .map(
            (y) =>
              block(x, y, 47, 60) +
              accent(x, y, 47, 5, x % 2 === 0 ? 'var(--color-cobalt)' : 'var(--color-marker)', 2),
          )
          .join(''),
      )
      .join(''),
    dimension(90, 244, 300, '1920 px'),
    `<text x='90' y='292' font-size='15' font-weight='600' style='fill:var(--color-ink)'>1920 × 1080</text>`,
    chips(
      ['Four columns', 'Two levels of nav', 'Dense tables', 'Keyboard shortcuts'],
      90,
      302,
      390,
    ),
  ].join('\n'),
);

/* --- television ---------------------------------------------------------- */

const tv = svg(
  'Wireframe of a television layout at 2560 by 1440 pixels: a ten-foot interface with one large focused tile',
  'screen-tv-title',
  [
    frame(90, 26, 300, 169, 6),
    `<rect x='226' y='199' width='28' height='12' rx='2' style='fill:var(--color-ink)' fill-opacity='0.45' />`,
    `<rect x='200' y='211' width='80' height='6' rx='3' style='fill:var(--color-ink)' fill-opacity='0.6' />`,
    accent(100, 38, 26, 9, 'var(--color-cobalt)', 3),
    block(100, 56, 118, 125, 0.08, 6),
    `<rect x='100' y='56' width='118' height='125' rx='6' fill='none' style='stroke:var(--color-cobalt)' stroke-width='2' />`,
    block(110, 68, 70, 7, 0.25, 2),
    block(110, 82, 46, 5, 0.15, 2),
    block(228, 56, 68, 58, 0.08, 6),
    block(228, 124, 68, 57, 0.08, 6),
    block(306, 56, 74, 125, 0.08, 6),
    dimension(90, 244, 300, '2560 px'),
    `<text x='90' y='292' font-size='15' font-weight='600' style='fill:var(--color-ink)'>2560 × 1440</text>`,
    chips(['Ten-foot UI', 'One focus ring', 'Oversized type', 'D-pad navigation'], 90, 302, 390),
  ].join('\n'),
);

export const responsive: Topic = {
  slug: 'responsive',
  title: 'Responsive design',
  tagline: 'Design for the range of screens, not for a list of devices.',
  summary:
    'Responsive design in a system is not a set of breakpoints you check off. It is a decision about which properties change with the viewport, which change with the container, and which never change at all.',
  sections: [
    {
      id: 'strategy',
      title: 'A strategy, not a device list',
      intro: 'Design for the space available, not for the phone in your hand.',
      body: 'The old way — "a tablet layout for iPad, a desktop layout for a laptop" — fails constantly, because the number of possible widths is unbounded and the device list is always out of date. Breakpoints are a symptom of a layout breaking, not a feature of it.\n\nThe useful question is: which properties need to change as the space changes? For most interfaces the answer is a short list: the number of columns, the order of blocks, and whether a sidebar is a sidebar or a drawer. If you can name those three, you can pick breakpoints where they need to change and stop there.',
      items: [
        {
          title: 'Columns',
          body: 'How many items sit side by side. This is the most common thing to change and the easiest to do with auto-fit grids.',
        },
        {
          title: 'Order',
          body: 'Which block leads. A form may put its fields above the action on narrow screens and beside it on wide ones.',
        },
        {
          title: 'Chrome',
          body: 'Whether navigation is a permanent bar, a drawer, or a bottom tab. This is the most expensive change, so do it last.',
        },
      ],
      rules: [
        'Break where the content breaks, not where a device happens to be.',
        'Prefer `auto-fit` and `minmax` grids so the layout responds without named breakpoints.',
        'Fewer breakpoints is better. Every one is a set of rules to maintain and test.',
      ],
    },
    {
      id: 'breakpoints',
      title: 'Breakpoints',
      intro: 'Four is plenty. Choose them once and let everybody use them.',
      body: 'If you do need named breakpoints, define them as tokens and use them everywhere — CSS media queries, Tailwind prefixes, JavaScript matchers. A breakpoint that exists in CSS but not in JS is a breakpoint that will drift.\n\nThe useful trick is **content-driven breakpoints**: resize the window until the content looks wrong, and that is your breakpoint. It is usually not where you expected. Then round it to the nearest token so the whole system agrees.',
      examples: [
        '`sm` — 640px — two columns, side-by-side form fields',
        '`md` — 768px — three columns, sidebar becomes permanent',
        '`lg` — 1024px — content column gains a max width and a gutter',
        '`xl` — 1280px — the widest content column, so the measure stays readable',
      ],
      rules: [
        'Define breakpoints once, as tokens, and use them in CSS and JS alike.',
        'Use `em` units so they respond to the user’s root font size.',
        'Mobile-first: base styles target the narrow case, then widen.',
        'Never hide the primary action on a small screen. Change its layout, not its availability.',
      ],
      code: {
        label: 'app/globals.css',
        source: `@theme {
  --breakpoint-sm: 40rem;   /* 640px */
  --breakpoint-md: 48rem;   /* 768px */
  --breakpoint-lg: 64rem;   /* 1024px */
  --breakpoint-xl: 80rem;   /* 1280px */
}`,
      },
    },
    {
      id: 'screens',
      title: 'Five sizes, five layouts',
      intro: 'The same page at five widths — what changes is columns, order and chrome.',
      body: 'These are not five designs. They are one design under five constraints, and the constraints are the width, the input method and the distance from the screen. Everything that changes is on the outside of the page: how many columns of content fit, where the navigation lives, how big the targets are and how much type is set at.\n\nThe frames below are drawn to scale with each other, so a phone really is a fraction of a television. That difference is why the same layout cannot simply shrink: a 44px touch target on a phone is a third of the screen width on a television, and a 14px label on a television is unreadable from a sofa.',
      visuals: [
        {
          title: 'Mobile — 360 × 740',
          caption:
            'One column and a bottom tab bar. The action that matters stays on screen, and every target is at least 44px because there is no cursor to aim it.',
          svg: mobile,
          minWidth: 380,
          maxWidth: 520,
        },
        {
          title: 'Tablet — 768 × 1024',
          caption:
            'Two columns and a permanent navigation rail. The rail replaces the tab bar as soon as there is room for it, and it survives a rotation.',
          svg: tablet,
          minWidth: 380,
          maxWidth: 520,
        },
        {
          title: 'Laptop — 1280 × 800',
          caption:
            'Three columns, a persistent sidebar and a top navigation. Hover is available again, and the keyboard becomes the primary input.',
          svg: laptop,
          minWidth: 380,
          maxWidth: 520,
        },
        {
          title: 'Desktop — 1920 × 1080',
          caption:
            'Four columns and a second level of navigation. Density is the win here: more rows are visible, so more of the page can be scanned at once.',
          svg: desktop,
          minWidth: 380,
          maxWidth: 520,
        },
        {
          title: 'Television — 2560 × 1440',
          caption:
            'Ten feet from the screen, so everything is different: no hover, no dense tables, one focused item at a time and type you can read across a room.',
          svg: tv,
          minWidth: 380,
          maxWidth: 520,
        },
        {
          title: 'The matrix',
          caption:
            'The same four properties at every size. When a new screen arrives, fill in a row — do not start a new design.',
          full: true,
          table: {
            columns: ['Screen', 'Viewport', 'Columns', 'Navigation', 'Type'],
            rows: [
              ['Mobile', '360 × 740', '1', 'Bottom tab bar', '16px body, 44px targets'],
              ['Tablet', '768 × 1024', '2', 'Navigation rail', '16px body, 40px targets'],
              ['Laptop', '1280 × 800', '3', 'Sidebar + top nav', '15px body, pointer'],
              ['Desktop', '1920 × 1080', '4', 'Sidebar + top nav', '14px body, pointer'],
              ['Television', '2560 × 1440', '2', 'Focus ring, D-pad', '24px body, 10-foot'],
            ],
          },
        },
      ],
      rules: [
        'Change columns, order and chrome. Everything else stays the same.',
        'The chrome is the expensive change: switch from tabs to a rail to a sidebar, in that order.',
        'Type gets larger as the viewing distance gets larger, not smaller.',
        'Never design to a device. Design to the width you have and the input you have.',
      ],
    },
    {
      id: 'fluid',
      title: 'Fluid values',
      intro: 'Let the space interpolate instead of jumping.',
      body: 'Between breakpoints, size can be continuous. `clamp()` gives a minimum, a preferred value that scales with the viewport, and a maximum — so a headline never gets absurdly small on a 320px phone and never eats the screen on a 4K display.\n\nUse fluid sizing for type, spacing and radii. Use fixed sizes for things that must be exactly that size, such as touch targets, icon grids and anything with a fixed pixel budget.',
      rules: [
        'Use `clamp()` for type and spacing that scales between breakpoints.',
        'Use `min()`, `max()` and `dvh` for viewport-relative sizing.',
        'Never scale a font below 16px, whatever the clamp says.',
        'Use `dvh` rather than `vh` for full-height layouts, so mobile browser chrome does not clip them.',
      ],
      code: {
        label: 'app/globals.css',
        source: `:root {
  /* 16px on a 320px screen, 20px on a 1280px screen */
  --text-lead: clamp(1.125rem, 0.9rem + 1vw, 1.375rem);
  --space-section: clamp(3rem, 2rem + 4vw, 6rem);
}

.full-height {
  min-height: 100dvh;
}`,
      },
    },
    {
      id: 'containers',
      title: 'Container queries',
      intro: 'Respond to the space you were given, not the window.',
      body: 'A card in a narrow sidebar and the same card in a wide grid column are different problems, but a media query cannot tell them apart — it only knows the viewport. Container queries let a component respond to the width of its own container, which is what makes a component genuinely reusable.\n\nThe rule of thumb: use a container query for a component that appears in more than one layout, and a media query for the page shell.',
      rules: [
        'Use container queries for components that appear in multiple layouts.',
        'Use media queries for the page shell and global navigation.',
        'Declare the container with `container-type: inline-size` on the wrapper.',
        'Style the container itself with `@container`, never with its own width.',
      ],
      code: {
        label: 'components/CardGrid.tsx',
        source: `export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container">
      <div className="grid gap-4 @md:grid-cols-2 @4xl:grid-cols-3">{children}</div>
    </div>
  );
}`,
      },
    },
    {
      id: 'touch',
      title: 'Touch, pointer and input',
      intro: 'The device is not the only difference.',
      body: 'A layout built for a mouse is wrong on a phone in ways that viewport width alone will not reveal. Touch targets need to be at least **44×44px** — small text links in a footer are the classic failure. Hover-only affordances are unreachable on a touch device, so anything that appears on hover also needs a tap or focus state.\n\nUse `@media (hover: hover)` to gate hover styles, so they never stick on a touch screen. Use `@media (pointer: coarse)` to detect touch and adjust hit areas.',
      rules: [
        'Minimum touch target: 44×44px, including padding.',
        'Never hide information behind hover alone.',
        'Gate hover styles with `@media (hover: hover)`.',
        'Do not disable pinch-to-zoom (`touch-action` should not block it).',
        'Increase spacing between adjacent targets so they are not mis-tapped.',
      ],
    },
    {
      id: 'images',
      title: 'Images and media',
      intro: 'The largest paint is usually the one that breaks.',
      body: 'Responsive images are the single biggest performance lever on a content site. Serve the right size with `srcset` and `sizes`, keep the aspect ratio reserved with `aspect-ratio` so nothing shifts, and always have `width` and `height` so the browser can reserve the space before the file arrives.\n\nFor illustrations and diagrams, an SVG scales for free; a raster image needs real candidates. For video, set `poster` so the first frame is not a black box.',
      rules: [
        'Always set `width` and `height` on images to reserve space.',
        'Use `srcset` with `sizes` for anything that is not a fixed-width asset.',
        'Set `aspect-ratio` on media containers.',
        'Lazy-load below the fold; never lazy-load the hero image.',
        'Use `decoding="async"` for images that are not the LCP element.',
      ],
      code: {
        label: 'components/Hero.tsx',
        source: `<img
  src="/images/hero-800.jpg"
  srcSet="/images/hero-400.jpg 400w,
          /images/hero-800.jpg 800w,
          /images/hero-1600.jpg 1600w"
  sizes="(min-width: 1024px) 50vw, 100vw"
  width={1600}
  height={900}
  alt="A drafting table with the design system token sheet"
  fetchPriority="high"
  decoding="async"
/>`,
      },
    },
    {
      id: 'testing',
      title: 'Testing',
      intro: 'Test the range, not the extremes.',
      body: 'A layout that only works at 375px and 1440px is broken in between. Test the widths where the content actually changes: 320px (small phone), 768px (tablet portrait), 1024px (laptop, with a sidebar appearing) and 1920px (desktop). Zoom to 200% and 400% — at 400% a 1280px viewport behaves like a 320px one, which is exactly how a lot of people read a page.\n\nAutomate what you can. Playwright can screenshot a handful of widths on every pull request and diff the result. That catches the layout that broke while someone changed a margin.',
      rules: [
        'Test 320, 768, 1024 and 1920 on every major layout.',
        'Test at 200% and 400% browser zoom.',
        'Screenshot-test key pages at those widths in CI.',
        'Check with the browser at 200% zoom on a real phone.',
        'Turn off the network throttling and look for layout shift.',
      ],
      code: {
        label: 'tests/responsive.spec.ts',
        source: `import { test } from "@playwright/test";

const widths = [320, 768, 1024, 1920];

for (const width of widths) {
  test(\`home page at \${width}px\`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveScreenshot(\`home-\${width}.png\`);
  });
}`,
      },
    },
  ],
};
