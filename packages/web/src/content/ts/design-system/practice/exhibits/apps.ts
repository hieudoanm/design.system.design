/*
 * The Exhibit apps as data: one entry per showcase app, grouped by category
 * for the chapter page and detailed on its own route. Descriptions follow
 * the Exhibit home page; `takeaway` is the design-system lesson each app
 * teaches, and `chapters` links the patterns it demonstrates.
 */

export type ExhibitCategoryId = 'business' | 'finance' | 'social' | 'ai' | 'security' | 'graphics';

export type ExhibitStatus = 'ready' | 'coming-soon';

export interface ExhibitChapter {
  slug: string;
  title: string;
  /** What the app shows of that chapter's subject. */
  note: string;
}

export interface ExhibitApp {
  slug: string;
  name: string;
  category: ExhibitCategoryId;
  status: ExhibitStatus;
  /** What the app is, in one sentence. */
  description: string;
  /** The design-system lesson the app teaches. */
  takeaway: string;
  /** Chapters in this guide whose patterns the app demonstrates. */
  chapters: ExhibitChapter[];
  /** Live deployment, once known. */
  liveUrl?: string;
}

export const exhibitCategories: {
  id: ExhibitCategoryId;
  title: string;
  intro: string;
}[] = [
  {
    id: 'business',
    title: 'Business',
    intro:
      'Apps that run a counter or a floor: dense, fast, and unforgiving of ambiguity. They are where transactional UI patterns earn or lose their keep.',
  },
  {
    id: 'finance',
    title: 'Finance',
    intro:
      'Money interfaces carry the highest cost for a misread number. These apps show how tabular data, forms and audit trails are designed under that pressure.',
  },
  {
    id: 'social',
    title: 'Social',
    intro:
      'Conversation is a real-time data display. The interesting problems are states — sent, delivered, read — and keeping a fast-moving list legible.',
  },
  {
    id: 'ai',
    title: 'AI',
    intro:
      'Generative interfaces break the old contract: the content arrives in pieces, the output is non-deterministic, and the controls steer a model rather than a form.',
  },
  {
    id: 'security',
    title: 'Security',
    intro:
      'Security UX is mostly restraint: the interface must help without ever exposing the secret it protects.',
  },
  {
    id: 'graphics',
    title: 'Graphics design',
    intro:
      'Tool-style apps turn a single job — compress, trim, convert — into a form plus a progress state. The craft is in the parameters and the preview.',
  },
];

export const exhibitCategoryTitle = (id: ExhibitCategoryId): string =>
  exhibitCategories.find((category) => category.id === id)?.title ?? id;

export const exhibitApps: ExhibitApp[] = [
  {
    slug: 'pos',
    name: 'POS',
    category: 'business',
    status: 'ready',
    description: 'A minimal point-of-sale client with inventory, shifts and reporting.',
    takeaway:
      'Transactional screens live or die on their empty and pending states. A POS has no patience for ambiguity: every line item, total and payment state needs a designed face, and the same atoms — quantity stepper, total row, status badge — repeat across cart, receipt and report.',
    chapters: [
      {
        slug: 'data-display',
        title: 'Data display',
        note: 'Line items, totals and shift summaries are compact tables that must scan in one glance.',
      },
      {
        slug: 'overlays',
        title: 'Overlays',
        note: 'Payment confirmation and receipt previews are modals that must not break the sale flow.',
      },
      {
        slug: 'feedback',
        title: 'Feedback',
        note: 'A payment is a state machine — pending, approved, declined — and each state needs visible feedback.',
      },
      {
        slug: 'forms',
        title: 'Forms',
        note: 'Quantity and discount inputs are forms stripped to speed: minimal fields, immediate validation.',
      },
    ],
  },
  {
    slug: 'menu',
    name: 'Menu',
    category: 'business',
    status: 'coming-soon',
    description: 'A digital menu board for restaurants and cafes.',
    takeaway:
      'A menu board is read-only data display under real-world conditions — glare, distance, a queue waiting. Legibility beats decoration: type size, contrast and grouping carry the design, and there is no interaction to hide behind.',
    chapters: [
      {
        slug: 'typography',
        title: 'Typography',
        note: 'Menu type is sized for reading at arm’s length in bad light, not for a browser default.',
      },
      {
        slug: 'color-science',
        title: 'Color science & perception',
        note: 'Contrast is a functional requirement on a board viewed across a room.',
      },
      {
        slug: 'data-display',
        title: 'Data display',
        note: 'Categories, prices and descriptions are a hierarchy problem solved with spacing and weight.',
      },
    ],
  },
  {
    slug: 'wallet',
    name: 'Wallet',
    category: 'finance',
    status: 'ready',
    description: 'Personal banking with accounts, cards, payments, budgets and reports.',
    takeaway:
      'The scale test. With around thirty screens — accounts, transfers, budgets, rates, reports — shared atoms and molecules are what keep the app coherent: a transaction row, a filter bar and a summary card are built once and reused everywhere. This is where atomic design stops being a diagram and becomes infrastructure.',
    chapters: [
      {
        slug: 'atomic-design',
        title: 'Atomic Design',
        note: 'The app is organised as atoms, molecules and organisms per feature — the reference implementation of the ladder.',
      },
      {
        slug: 'data-grids',
        title: 'Data grids & tables',
        note: 'Transaction lists need sorting, filtering and scanning at density.',
      },
      {
        slug: 'charts',
        title: 'Charts',
        note: 'Spending summaries turn a table of transactions into a shape the user can read.',
      },
      {
        slug: 'forms',
        title: 'Forms',
        note: 'Transfer and bill forms are the highest-stakes inputs in the app — validation is the product.',
      },
      {
        slug: 'navigation',
        title: 'Navigation',
        note: 'Thirty screens need a navigation model that stays learnable — the header and section nav carry it.',
      },
    ],
  },
  {
    slug: 'tax',
    name: 'Tax',
    category: 'finance',
    status: 'ready',
    description: 'Vietnamese tax management with business submissions and an audit trail.',
    takeaway:
      'An audit trail is a data-display pattern with strict rules: immutable rows, explicit timestamps, and a ordering the user can trust. Compliance interfaces succeed when they feel boring — the drama belongs in the numbers, not the chrome.',
    chapters: [
      {
        slug: 'data-grids',
        title: 'Data grids & tables',
        note: 'The audit log is a dense, sortable table where every cell must be trustworthy.',
      },
      {
        slug: 'data-display',
        title: 'Data display',
        note: 'Deadlines, amounts and statuses are formatted consistently everywhere they appear.',
      },
      {
        slug: 'forms',
        title: 'Forms',
        note: 'Submission forms encode tax rules as validation — the interface teaches the regulation.',
      },
      {
        slug: 'feedback',
        title: 'Feedback',
        note: 'A filed submission is a moment that must feel final and confirmed.',
      },
    ],
  },
  {
    slug: 'chat',
    name: 'Chat',
    category: 'social',
    status: 'ready',
    description: 'Real-time messaging with groups, calls and end-to-end encryption.',
    takeaway:
      'Messaging is a real-time data display where the states are the interface: sent, delivered, read, typing. The design problem is keeping a fast-moving list legible while every message carries a lifecycle the user can see.',
    chapters: [
      {
        slug: 'data-display',
        title: 'Data display',
        note: 'Message lists, member lists and call logs are streams that must stay scannable.',
      },
      {
        slug: 'feedback',
        title: 'Feedback',
        note: 'Delivery ticks and typing indicators are feedback at conversational speed.',
      },
      {
        slug: 'overlays',
        title: 'Overlays',
        note: 'Group settings and media viewers are overlays that must not lose the conversation.',
      },
    ],
  },
  {
    slug: 'ai',
    name: 'AI Chat',
    category: 'ai',
    status: 'ready',
    description: 'AI chat with model switching, system prompts and streaming replies.',
    takeaway:
      'Generative interfaces break the form contract: content arrives in fragments, output is non-deterministic, and controls steer a model rather than submit a request. The patterns that matter are progressive rendering, streaming states and honest affordances for regenerate and stop.',
    chapters: [
      {
        slug: 'feedback',
        title: 'Feedback',
        note: 'Streaming tokens need progressive feedback — a caret, a shimmer, a stop control — that keeps up with the model.',
      },
      {
        slug: 'forms',
        title: 'Forms',
        note: 'The prompt box is a form with one field and infinite consequences; system prompts live behind progressive disclosure.',
      },
      {
        slug: 'component-api',
        title: 'Component API design',
        note: 'The model switcher is a small API-design problem: a handful of options, clear current state, one-tap change.',
      },
      {
        slug: 'animation',
        title: 'Animation',
        note: 'Motion marks the boundary between user turn and model turn in a conversation that has no page loads.',
      },
    ],
  },
  {
    slug: 'password',
    name: 'Password',
    category: 'security',
    status: 'ready',
    description: 'A secure password manager with generator, vault and health checks.',
    takeaway:
      'Security UX is mostly restraint. The interface must help users choose and store strong secrets without ever exposing them: masked by default, strength feedback that teaches rather than judges, and destructive actions that confirm without panicking.',
    chapters: [
      {
        slug: 'forms',
        title: 'Forms',
        note: 'Password fields set the rules: masking, reveal toggles and validation that explains itself.',
      },
      {
        slug: 'feedback',
        title: 'Feedback',
        note: 'The strength meter and health report turn cryptography into something the user can act on.',
      },
      {
        slug: 'data-display',
        title: 'Data display',
        note: 'The vault lists credentials without ever rendering the secrets themselves.',
      },
      {
        slug: 'overlays',
        title: 'Overlays',
        note: 'Master-password prompts gate the vault — an overlay that must feel like a lock, not a nag.',
      },
    ],
  },
  {
    slug: 'video',
    name: 'Video',
    category: 'graphics',
    status: 'ready',
    description: 'A video toolbox with compress, trim, merge, crop, convert and subtitles.',
    takeaway:
      'Tool apps are a form plus a job: parameters on one side, progress and output on the other. The design work is making a pipeline of ffmpeg-shaped operations feel like a sequence of small, reversible decisions.',
    chapters: [
      {
        slug: 'forms',
        title: 'Forms',
        note: 'Codec, bitrate and trim parameters are dense forms that need grouping and sane defaults.',
      },
      {
        slug: 'feedback',
        title: 'Feedback',
        note: 'Encoding is a long job — progress, cancellation and completion states are the product.',
      },
      {
        slug: 'data-display',
        title: 'Data display',
        note: 'File queues and output lists are job-tracking tables with status at their core.',
      },
    ],
  },
  {
    slug: 'gallery',
    name: 'Gallery',
    category: 'graphics',
    status: 'ready',
    description: 'A mobile photo library with albums, search, favorites and a viewer.',
    takeaway:
      'Media grids are a layout problem before they are a content problem: consistent aspect ratios, lazy states and a viewer that does not trap focus. The grid is the interface; the photo is just what passes through it.',
    chapters: [
      {
        slug: 'layout',
        title: 'Layout',
        note: 'A uniform grid survives any aspect ratio — the classic media-library solution.',
      },
      {
        slug: 'data-display',
        title: 'Data display',
        note: 'Albums, favorites and search results are the same grid with different filters.',
      },
      {
        slug: 'overlays',
        title: 'Overlays',
        note: 'The photo viewer is a full-screen overlay that must return focus and scroll correctly.',
      },
      {
        slug: 'navigation',
        title: 'Navigation',
        note: 'Albums and recents are two views of one collection — navigation between them must feel like a filter, not a page load.',
      },
    ],
  },
];

export const getExhibitApp = (slug: string): ExhibitApp | undefined =>
  exhibitApps.find((app) => app.slug === slug);

export const exhibitAppsByCategory = (category: ExhibitCategoryId): ExhibitApp[] =>
  exhibitApps.filter((app) => app.category === category);
