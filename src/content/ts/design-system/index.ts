/**
 * The design system is twenty topics. Each one lives in its own file and exports
 * a `Topic`; this barrel is the only place the list is assembled.
 *
 * The topic files import their type from here with `import type`, which is
 * erased at compile time — there is no runtime cycle.
 */

import type { TopicBlock, TopicItem, TopicVisual } from '../types';

export type { TopicBlock, TopicItem, TopicQa, TopicTable, TopicVisual } from '../types';

/**
 * A chapter section. New content should use `blocks`; the flat fields remain so
 * the existing chapters keep working without a rewrite.
 */
export type TopicSection = {
  id: string;
  title: string;
  intro?: string;
  blocks?: TopicBlock[];
  body?: string;
  items?: TopicItem[];
  examples?: string[];
  rules?: string[];
  code?: { label: string; source: string };
  visuals?: TopicVisual[];
};

/** The six groups the chapters are arranged into, in reading order. */
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
  {
    id: 'specialized',
    title: 'Specialized',
    intro: 'Deep dives into color science, component APIs, data grids, and i18n.',
  },
] as const;

export type TopicGroupId = (typeof topicGroups)[number]['id'];

export type Topic = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  /** Which of the six groups the chapter belongs to. */
  group: TopicGroupId;
  sections: TopicSection[];
};

import { designTokens, colors, typography, spacing } from './foundations';
import { atomicDesign, layout, elevation, icongraphy } from './structure';
import { charts, scientificCharts, dataDisplay, feedback } from './data-charts';
import { animation, forms, navigation, overlays } from './interaction';
import { accessibility, responsive, theming, governance } from './practice';
import { colorScience, componentApi, dataGrids, i18n } from './specialized';

export { designTokens, colors, typography, spacing } from './foundations';
export { atomicDesign, layout, elevation, icongraphy } from './structure';
export { charts, scientificCharts, dataDisplay, feedback } from './data-charts';
export { animation, forms, navigation, overlays } from './interaction';
export { accessibility, responsive, theming, governance } from './practice';
export { colorScience, componentApi, dataGrids, i18n } from './specialized';

/** The twenty topics, in reading order. */
export const topics: Topic[] = [
  designTokens,
  colors,
  typography,
  spacing,
  colorScience,
  atomicDesign,
  layout,
  elevation,
  icongraphy,
  componentApi,
  dataDisplay,
  charts,
  scientificCharts,
  dataGrids,
  feedback,
  forms,
  navigation,
  overlays,
  animation,
  accessibility,
  responsive,
  theming,
  i18n,
  governance,
];

/** The topics of one group, in reading order. */
export const topicsByGroup = (group: TopicGroupId): Topic[] =>
  topics.filter((topic) => topic.group === group);

export const getTopic = (slug: string): Topic | undefined =>
  topics.find((topic) => topic.slug === slug);
