/**
 * The design system is twenty topics. Each one lives in its own file and exports
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

/** The five groups the chapters are arranged into, in reading order. */
export const topicGroups = [
  {
    id: 'foundations',
    title: 'Foundations',
    intro: 'The primitives every other chapter builds on.',
  },
  {
    id: 'structure',
    title: 'Structure',
    intro: 'How the pieces are organised into a system.',
  },
  {
    id: 'data-charts',
    title: 'Data & charts',
    intro: 'Showing information, from tables to scientific plots.',
  },
  {
    id: 'interaction',
    title: 'Interaction',
    intro: 'The pieces a person actually operates.',
  },
  {
    id: 'practice',
    title: 'Practice',
    intro: 'The cross-cutting concerns that keep a system healthy.',
  },
] as const;

export type TopicGroupId = (typeof topicGroups)[number]['id'];

export type Topic = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  /** Which of the five groups the chapter belongs to. */
  group: TopicGroupId;
  sections: TopicSection[];
};

import { atomicDesign } from './atomic-design';
import { designTokens } from './design-tokens';
import { colors } from './colors';
import { elevation } from './elevation';
import { spacing } from './spacing';
import { layout } from './layout';
import { typography } from './typography';
import { forms } from './forms';
import { dataDisplay } from './data-display';
import { feedback } from './feedback';
import { icongraphy } from './icongraphy';
import { charts } from './charts';
import { scientificCharts } from './scientific-charts';
import { accessibility } from './accessibility';
import { responsive } from './responsive';
import { animation } from './animation';
import { theming } from './theming';
import { navigation } from './navigation';
import { overlays } from './overlays';
import { governance } from './governance';

export { atomicDesign } from './atomic-design';
export { designTokens } from './design-tokens';
export { colors } from './colors';
export { elevation } from './elevation';
export { spacing } from './spacing';
export { layout } from './layout';
export { typography } from './typography';
export { forms } from './forms';
export { dataDisplay } from './data-display';
export { feedback } from './feedback';
export { icongraphy } from './icongraphy';
export { charts } from './charts';
export { scientificCharts } from './scientific-charts';
export { accessibility } from './accessibility';
export { responsive } from './responsive';
export { animation } from './animation';
export { theming } from './theming';
export { navigation } from './navigation';
export { overlays } from './overlays';
export { governance } from './governance';

/** The twenty topics, in reading order. */
export const topics: Topic[] = [
  designTokens,
  colors,
  typography,
  spacing,
  atomicDesign,
  layout,
  elevation,
  icongraphy,
  dataDisplay,
  charts,
  scientificCharts,
  feedback,
  forms,
  navigation,
  overlays,
  animation,
  accessibility,
  responsive,
  theming,
  governance,
];

/** The topics of one group, in reading order. */
export const topicsByGroup = (group: TopicGroupId): Topic[] =>
  topics.filter((topic) => topic.group === group);

export const getTopic = (slug: string): Topic | undefined =>
  topics.find((topic) => topic.slug === slug);
