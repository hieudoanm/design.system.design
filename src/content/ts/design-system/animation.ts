import type { Topic } from './index';

/*
 * The animation diagrams below are plain SVG. Each shows a timing diagram
 * or state transition. The easing curves use the system's motion tokens.
 */

const svg = (title: string, id: string, viewBox: string, body: string) =>
  [
    `<svg viewBox='${viewBox}' width='100%' role='img' aria-labelledby='${id}' xmlns='http://www.w3.org/2000/svg'>`,
    `<title id='${id}'>${title}</title>`,
    body,
    `</svg>`,
  ].join('\n');

/* --- easing curves ------------------------------------------------------- */

const easingCurvesSvg = svg(
  'Four easing curves: linear, ease-in, ease-out, ease-in-out',
  'easing-curves',
  '0 0 400 200',
  [
    `<g stroke='var(--color-rule)' stroke-width='1' fill='none'>`,
    `<path d='M20,180 L380,20' />`,
    `</g>`,
    `<g stroke='var(--color-chart-1)' stroke-width='2' fill='none'>`,
    `<path d='M20,180 C20,180 380,20 380,20' />`,
    `</g>`,
    `<g stroke='var(--color-chart-2)' stroke-width='2' fill='none'>`,
    `<path d='M20,180 C100,180 300,20 380,20' />`,
    `</g>`,
    `<g stroke='var(--color-chart-3)' stroke-width='2' fill='none'>`,
    `<path d='M20,180 C280,180 120,20 380,20' />`,
    `</g>`,
    `<g stroke='var(--color-chart-4)' stroke-width='2' fill='none'>`,
    `<path d='M20,180 C100,180 280,20 380,20' />`,
    `</g>`,
    `<g font-size='10' fill='var(--color-mute)'>`,
    `<text x='20' y='195'>linear</text>`,
    `<text x='100' y='195'>ease-in</text>`,
    `<text x='200' y='195'>ease-out</text>`,
    `<text x='300' y='195'>ease-in-out</text>`,
    `</g>`,
  ].join('\n'),
);

/* --- motion tokens ------------------------------------------------------- */

const motionTable = {
  columns: ['Token', 'Value', 'Use case'],
  rows: [
    ['--duration-instant', '0ms', 'Color changes, opacity toggles'],
    ['--duration-fast', '100ms', 'Hover states, small transitions'],
    ['--duration-normal', '200ms', 'Default: panels, modals, menus'],
    ['--duration-slow', '300ms', 'Page transitions, complex expansions'],
    ['--duration-slower', '500ms', 'Full-screen transitions'],
    ['--ease-linear', 'linear', 'Mechanical: spinners, progress bars'],
    ['--ease-in', 'cubic-bezier(0.4, 0, 1, 1)', 'Elements entering from off-screen'],
    ['--ease-out', 'cubic-bezier(0, 0, 0.2, 1)', 'Elements exiting, dismissals'],
    ['--ease-in-out', 'cubic-bezier(0.4, 0, 0.2, 1)', 'Default: most transitions'],
    ['--ease-spring', 'cubic-bezier(0.34, 1.56, 0.64, 1)', 'Playful: toasts, celebrations'],
  ],
};

/* --- choreography -------------------------------------------------------- */

const choreography = svg(
  'Staggered entrance: parent → children with 50ms delay each',
  'choreography',
  '0 0 400 160',
  [
    `<g font-size='11' fill='var(--color-mute)'>`,
    `<text x='10' y='25'>Parent</text>`,
    `<text x='10' y='55'>Child 1</text>`,
    `<text x='10' y='85'>Child 2</text>`,
    `<text x='10' y='115'>Child 3</text>`,
    `</g>`,
    `<g stroke='var(--color-chart-1)' stroke-width='3' stroke-linecap='round'>`,
    `<line x1='80' y1='20' x2='320' y2='20' />`,
    `<line x1='130' y1='50' x2='320' y2='50' />`,
    `<line x1='180' y1='80' x2='320' y2='80' />`,
    `<line x1='230' y1='110' x2='320' y2='110' />`,
    `</g>`,
    `<g fill='var(--color-chart-1)'>`,
    `<circle cx='80' cy='20' r='5' /><circle cx='320' cy='20' r='5' />`,
    `<circle cx='130' cy='50' r='5' /><circle cx='320' cy='50' r='5' />`,
    `<circle cx='180' cy='80' r='5' /><circle cx='320' cy='80' r='5' />`,
    `<circle cx='230' cy='110' r='5' /><circle cx='320' cy='110' r='5' />`,
    `</g>`,
    `<g font-size='10' fill='var(--color-mute)'>`,
    `<text x='80' y='15'>0ms</text><text x='320' y='15'>200ms</text>`,
    `<text x='130' y='45'>50ms</text><text x='320' y='45'>250ms</text>`,
    `<text x='180' y='75'>100ms</text><text x='320' y='75'>300ms</text>`,
    `<text x='230' y='105'>150ms</text><text x='320' y='105'>350ms</text>`,
    `</g>`,
  ].join('\n'),
);

/* --- state transitions --------------------------------------------------- */

const stateTransitions = svg(
  'Button states and transitions: default → hover → active → focus → disabled',
  'state-transitions',
  '0 0 500 120',
  [
    `<g font-size='11' fill='var(--color-mute)'>`,
    `<text x='10' y='20'>Default</text>`,
    `<text x='110' y='20'>Hover</text>`,
    `<text x='210' y='20'>Active</text>`,
    `<text x='310' y='20'>Focus</text>`,
    `<text x='410' y='20'>Disabled</text>`,
    `</g>`,
    `<g stroke='var(--color-ink)' stroke-width='2' fill='var(--color-paper)' stroke-linecap='round' rx='6'>`,
    `<rect x='10' y='30' width='80' height='40' />`,
    `<rect x='110' y='30' width='80' height='40' style='background:var(--color-ink)' fill-opacity='0.08' />`,
    `<rect x='210' y='30' width='80' height='40' style='background:var(--color-ink)' fill-opacity='0.15' />`,
    `<rect x='310' y='30' width='80' height='40' stroke='var(--color-cobalt)' stroke-width='3' />`,
    `<rect x='410' y='30' width='80' height='40' stroke='var(--color-mute)' stroke-dasharray='4 2' fill-opacity='0.5' />`,
    `</g>`,
    `<g font-size='10' fill='var(--color-chart-2)'>`,
    `<text x='50' y='85'>100ms</text>`,
    `<text x='150' y='85'>50ms</text>`,
    `<text x='250' y='85'>0ms</text>`,
    `<text x='350' y='85'>0ms</text>`,
    `<text x='450' y='85'>—</text>`,
    `</g>`,
  ].join('\n'),
);

/* --- reduced motion ------------------------------------------------------ */

const reducedMotionTable = {
  columns: ['Motion type', 'Reduced behavior'],
  rows: [
    ['Transform (slide, scale, rotate)', 'Remove transform, fade only'],
    ['Opacity fade', 'Keep, but instant (0ms)'],
    ['Color/background transition', 'Keep, instant'],
    ['Spinner/loader rotation', 'Stop rotation, show static frame or pulse'],
    ['Parallax/scroll-linked', 'Disable entirely'],
    ['Auto-advance carousel', 'Pause auto-advance, keep manual controls'],
    ['Spring/bounce', 'Remove spring, use ease-out'],
  ],
};

/* --- component examples -------------------------------------------------- */

const componentExamples = {
  columns: ['Component', 'Entrance', 'Exit', 'State changes'],
  rows: [
    [
      'Modal / Dialog',
      'Fade + scale(0.95→1), 200ms',
      'Fade + scale(1→0.95), 150ms',
      'Focus trap, Escape to close',
    ],
    [
      'Dropdown / Popover',
      'Fade + translateY(-4→0), 150ms',
      'Fade + translateY(0→-4), 100ms',
      'Arrow flip, 100ms',
    ],
    [
      'Toast / Snackbar',
      'Slide up + fade, 200ms (spring)',
      'Slide down + fade, 200ms',
      'Progress bar drain',
    ],
    ['Tabs', 'Cross-fade panels, 150ms', '—', 'Indicator slide, 200ms ease-out'],
    [
      'Accordion',
      'Height auto, 200ms ease-in-out',
      'Height 0, 200ms ease-in-out',
      'Chevron rotate, 150ms',
    ],
    [
      'Sidebar / Drawer',
      'Slide from edge + fade backdrop, 250ms',
      'Slide to edge + fade, 200ms',
      'Backdrop click closes',
    ],
    [
      'Tooltip',
      'Fade + scale(0.8→1), 100ms',
      'Fade + scale(1→0.8), 50ms',
      'Follow cursor, 0ms delay',
    ],
    ['Carousel', 'Slide translateX, 300ms ease-in-out', '—', 'Dot indicator, 200ms'],
  ],
};

export const animation: Topic = {
  slug: 'animation',
  title: 'Animation',
  tagline: 'Motion as a system: tokens, choreography, and accessibility.',
  summary:
    'Animation is not decoration — it communicates state, guides attention, and makes interactions feel causal. A motion system defines tokens for duration and easing, choreography rules for multi-element sequences, and accessibility guardrails so motion helps rather than harms.',
  sections: [
    {
      id: 'principles',
      title: 'Principles',
      intro: 'Why we animate, and how we decide.',
      items: [
        {
          title: 'Motion has a job',
          body: 'Every animation answers a question: where did this come from? where is it going? what just happened? If you cannot name the question, the animation is decoration — remove it.',
        },
        {
          title: 'Fast by default',
          body: 'The default duration is 200ms. Users perceive interfaces as faster when transitions are snappy. Reserve slower durations (300ms+) for full-screen transitions where context shift is large.',
        },
        {
          title: 'Easing communicates physics',
          body: 'Ease-out for things leaving (they have momentum). Ease-in for things arriving (they are accelerating). Ease-in-out for things moving in place. Linear only for mechanical motion (spinners, progress).',
        },
        {
          title: 'Choreography over simultaneity',
          body: 'When multiple elements animate, stagger them. A 50ms stagger per element creates a wave that feels intentional. Simultaneous animation feels like a glitch.',
        },
        {
          title: 'Respect the user',
          body: 'prefers-reduced-motion is not optional. Honor it by removing transform motion, keeping only instant opacity/color changes. Never disable it because "the animation looks better."',
        },
      ],
      rules: [
        'No animation without a token. Hard-coded durations are bugs.',
        'Default duration: 200ms. Default easing: ease-in-out.',
        'Stagger: 50ms per element, max 300ms total cascade.',
        'Honor prefers-reduced-motion for every transform animation.',
        'Test at 200% zoom — animations must not cause layout shift.',
      ],
    },
    {
      id: 'tokens',
      title: 'Motion tokens',
      intro: 'Duration and easing as design tokens. Never hard-code.',
      code: {
        label: 'app/globals.css',
        source: `@theme {
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easings */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

:root {
  /* Default transition for most properties */
  --transition-default: var(--duration-normal) var(--ease-in-out);
}

/* Reduced motion: collapse all transform transitions */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
      },
      visuals: [
        {
          title: 'Easing curves',
          caption:
            'Four standard easings. Linear for mechanical motion. Ease-in for arrivals (accelerating). Ease-out for departures (decelerating). Ease-in-out for in-place movement.',
          svg: easingCurvesSvg,
          table: motionTable,
          minWidth: 320,
          maxWidth: 480,
        },
      ],
      rules: [
        'Use tokens in CSS: transition: var(--transition-default);',
        'Use tokens in JS: transition: { duration: 200, easing: [0.4, 0, 0.2, 1] }',
        'Instant (0ms) for color/opacity only. Never for transform.',
        'Spring easing only for delight moments (toasts, success states), not utility.',
      ],
    },
    {
      id: 'choreography',
      title: 'Choreography',
      intro: 'How multiple elements move together.',
      visuals: [
        {
          title: 'Staggered entrance',
          caption:
            'Parent starts at 0ms. Each child starts 50ms later. Total cascade: 200ms for 4 elements. The eye follows the wave, understanding hierarchy.',
          svg: choreography,
          minWidth: 320,
          maxWidth: 480,
        },
      ],
      items: [
        {
          title: 'Parent-first',
          body: 'Container animates in, then children stagger. Never children before parent — it breaks spatial logic.',
        },
        {
          title: 'Stagger delay',
          body: '50ms per element is the sweet spot. Faster feels simultaneous; slower feels sluggish. Cap total cascade at 300ms.',
        },
        {
          title: 'Directional consistency',
          body: 'Elements entering from the same direction (e.g., all sliding up) stagger together. Mixed directions need separate choreography.',
        },
        {
          title: 'Exit choreography',
          body: 'Reverse order, faster (75% of entrance duration). Elements leave before the container — the stage clears before the curtain falls.',
        },
      ],
      rules: [
        'Stagger delay: 50ms per element.',
        'Max cascade duration: 300ms.',
        'Exit is reverse order, 75% duration.',
        'Shared direction = shared choreography.',
      ],
    },
    {
      id: 'state-transitions',
      title: 'Component state transitions',
      intro: 'Standard transitions for interactive states.',
      visuals: [
        {
          title: 'Button state transitions',
          caption:
            'Hover: 100ms ease-out (quick response). Active: 0ms (instant feedback). Focus: 0ms (accessibility). Disabled: no transition, visual only.',
          svg: stateTransitions,
          minWidth: 400,
          maxWidth: 560,
        },
        {
          title: 'Component transition timings',
          caption:
            'Standard entrance, exit, and state-change durations for common components. All times reference motion tokens.',
          table: componentExamples,
        },
      ],
      rules: [
        'Hover/focus: fast (100ms) — the user is already there.',
        'Active/press: instant (0ms) — direct manipulation feels immediate.',
        'Focus ring: 0ms transition — accessibility cannot wait.',
        'Disabled: no transition — it is a state, not an interaction.',
        'Loading: pulse or spinner with --ease-linear, --duration-slow.',
      ],
    },
    {
      id: 'reduced-motion',
      title: 'Reduced motion',
      intro: 'prefers-reduced-motion: reduce is a user need, not a preference.',
      code: {
        label: 'app/globals.css',
        source: `@media (prefers-reduced-motion: reduce) {
  /* Disable all transform and complex animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep instant color/opacity changes */
  .btn:hover,
  .btn:focus {
    transition: background-color 0ms, color 0ms;
  }

  /* Spinners: show static frame or pulse instead of rotation */
  .spinner {
    animation: none;
    opacity: 0.7;
  }

  /* Carousels: pause auto-play */
  .carousel[data-auto] {
    animation-play-state: paused;
  }

  /* Smooth scroll: off */
  html {
    scroll-behavior: auto;
  }
}

/* JavaScript check */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  // Skip Framer Motion initial/animate, use only exit
}`,
      },
      visuals: [
        {
          title: 'Reduced motion behavior',
          caption:
            'How each motion type behaves when the user enables "Reduce motion" in their OS settings.',
          table: reducedMotionTable,
        },
      ],
      rules: [
        'Transform animations (slide, scale, rotate): remove entirely, fade only.',
        'Opacity/color transitions: keep but instant (0ms).',
        'Spinners: stop rotation, show static frame or gentle pulse.',
        'Auto-advance carousels: pause, keep manual controls.',
        'Parallax and scroll-linked animations: disable entirely.',
        'Test: enable "Reduce motion" in OS settings, verify no transform animation runs.',
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation patterns',
      intro: 'How to apply the system in React components.',
      code: {
        label: 'lib/motion.ts',
        source: `import { Variants, Transition } from 'motion/react';

/* Standard transitions from tokens */
export const transitions = {
  default: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  fast: { duration: 0.1, ease: [0, 0, 0.2, 1] },
  slow: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  instant: { duration: 0 },
} as const satisfies Record<string, Transition>;

/* Choreography variants */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
  exit: { opacity: 0, y: -10, transition: transitions.fast },
};

export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.default },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
};

/* Reduced motion guard */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/* Usage in a component */
function CardList({ items }) {
  const reduced = useReducedMotion();
  return (
    <motion.ul
      variants={reduced ? {} : staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={reduced ? {} : fadeSlideUp}
        >
          <Card {...item} />
        </motion.li>
      ))}
    </motion.ul>
  );
}`,
      },
      rules: [
        'Centralize variants in lib/motion.ts — do not inline variants in components.',
        'Use useReducedMotion() hook to conditionally disable variants.',
        'Exit animations must be fast — the user has already decided to leave.',
        'Animate presence (AnimatePresence) for mount/unmount, not conditional rendering.',
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping an animated component.',
      items: [
        {
          title: 'Token compliance',
          body: 'All durations and easings reference motion tokens. No hard-coded values.',
        },
        {
          title: 'Reduced motion tested',
          body: 'Enable OS "Reduce motion" — verify no transform animation runs, only instant opacity/color.',
        },
        {
          title: 'Performance',
          body: 'Animate only transform and opacity. Layout-triggering properties (width, height, top, left) are banned.',
        },
        {
          title: 'Choreography',
          body: 'Multi-element animations use stagger (50ms). Total cascade ≤ 300ms.',
        },
        {
          title: 'Exit animations',
          body: 'Every entrance has a matching exit. Exit is reverse order, 75% duration.',
        },
        {
          title: 'Accessibility',
          body: 'Focus states animate at 0ms. No animation blocks keyboard navigation.',
        },
      ],
    },
  ],
};
