/**
 * The shapes the shared TopicTemplate renders. Both subjects map their own
 * content into these types, so one template serves both routes.
 */

export type TopicTheme = 'system-design' | 'design-system';

export type TopicItem = {
  title: string;
  body: string;
};

export type TopicTable = {
  columns: string[];
  rows: string[][];
  /** When set, the table is collapsed behind this label; otherwise it is always visible. */
  summary?: string;
};

export type TopicVisual = {
  title: string;
  caption?: string;
  /** Inline SVG markup, hand-written in this repo. Trusted content. */
  svg?: string;
  /** The data behind the drawing — a chart's accessible fallback. */
  table?: TopicTable;
  /** Span the whole width of the section instead of a single column. */
  full?: boolean;
  /** Minimum rendered width in px; below it the figure scrolls sideways. */
  minWidth?: number;
  /** Maximum rendered width in px; the drawing is centred inside it. */
  maxWidth?: number;
};

export type TopicQa = { q: string; a: string };

/** One block of content inside a section. Blocks render in order, top to bottom. */
export type TopicBlock =
  | { type: 'prose'; text: string }
  | { type: 'code'; label?: string; source: string }
  | { type: 'diagram'; label?: string; source: string }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'items'; items: TopicItem[] }
  | { type: 'examples'; examples: string[] }
  | { type: 'rules'; rules: string[] }
  | { type: 'qa'; items: TopicQa[] }
  | { type: 'visuals'; visuals: TopicVisual[] };

/** A section of a topic page: an anchor, a heading and its blocks. */
export type TopicSectionData = {
  id: string;
  title: string;
  intro?: string;
  blocks: TopicBlock[];
};

/** Everything TopicTemplate needs to render one topic page. */
export type TopicPageData = {
  theme: TopicTheme;
  /** Small label above the title, e.g. "System Design · Hard". */
  category: string;
  title: string;
  tagline: string;
  sections: TopicSectionData[];
  /** Link in the sidebar, back to the index. */
  backLink: { href: string; label: string };
  footer?: {
    prev?: { href: string; title: string; label?: string };
    next?: { href: string; title: string; label?: string };
    backToIndex?: { href: string; label: string };
  };
};
