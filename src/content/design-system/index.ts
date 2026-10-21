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

export type TopicSection = {
  id: string;
  title: string;
  intro?: string;
  body?: string;
  items?: TopicItem[];
  examples?: string[];
  rules?: string[];
  code?: TopicCode;
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

export { components, atomicLevels, principles, practice, repoStructure } from './components';
export { designTokens } from './design-tokens';
export { fonts } from './fonts';
export { charts } from './charts';
export { accessibility } from './accessibility';
export { responsive } from './responsive';

/** The six topics, in reading order. */
export const topics: Topic[] = [components, designTokens, fonts, charts, accessibility, responsive];

export const getTopic = (slug: string): Topic | undefined =>
  topics.find((topic) => topic.slug === slug);
