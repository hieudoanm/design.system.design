/**
 * The design system is six topics. Each one lives in its own file and exports
 * a `Topic`; this barrel is the only place the list is assembled.
 *
 * The topic files import their type from here with `import type`, which is
 * erased at compile time — there is no runtime cycle.
 */

export type TopicCode = {
  label: string;
  source: string;
};

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

export type TopicSection = {
  id: string;
  title: string;
  intro?: string;
  body?: string;
  items?: TopicItem[];
  examples?: string[];
  rules?: string[];
  code?: TopicCode;
  visuals?: TopicVisual[];
};

export type Topic = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  sections: TopicSection[];
};

import { components } from './components';
import { designTokens } from './design-tokens';
import { fonts } from './fonts';
import { charts } from './charts';
import { accessibility } from './accessibility';
import { responsive } from './responsive';
import { icons } from './icons';
import { animation } from './animation';
import { scientificCharts } from './scientific-charts';

export { components, atomicLevels, principles, practice, repoStructure } from './components';
export { designTokens } from './design-tokens';
export { fonts } from './fonts';
export { charts } from './charts';
export { accessibility } from './accessibility';
export { responsive } from './responsive';
export { icons } from './icons';
export { animation } from './animation';
export { scientificCharts } from './scientific-charts';

/** The nine topics, in reading order. */
export const topics: Topic[] = [
  components,
  designTokens,
  fonts,
  charts,
  scientificCharts,
  accessibility,
  responsive,
  icons,
  animation,
];

export const getTopic = (slug: string): Topic | undefined =>
  topics.find((topic) => topic.slug === slug);
