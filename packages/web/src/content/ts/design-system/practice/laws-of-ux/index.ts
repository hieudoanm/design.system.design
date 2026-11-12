import type { Topic } from '../index';
import { lawGroups, lawsByGroup } from './laws';

/*
 * Adapted from Laws of UX (lawsofux.com), the open collection of psychology
 * principles for interface design by Jon Yablonski. Each law has its own
 * page under /design-system/laws-of-ux/<slug>; this chapter is the index.
 */
export const lawsOfUx: Topic = {
  slug: 'laws-of-ux',
  title: 'Laws of UX',
  tagline:
    'Thirty named principles from psychology that explain why an interface feels obvious — and where it breaks.',
  summary:
    'The Laws of UX are a curated set of cognitive psychology principles — Hick’s Law, Fitts’s Law, the Gestalt grouping laws and friends — that designers can cite when a decision needs a reason. They are heuristics, not laws: useful for reviews and defaults, never a substitute for testing with real users.',
  group: 'practice',
  sections: [
    ...lawGroups.map((group) => ({
      id: group.id,
      title: group.title,
      intro: group.intro,
      blocks: [
        {
          type: 'items' as const,
          items: lawsByGroup(group.id).map((law) => ({
            title: law.name,
            body: law.definition,
            href: `/design-system/laws-of-ux/${law.slug}`,
          })),
        },
      ],
    })),
    {
      id: 'using',
      title: 'Using them well',
      intro: 'A name is not an argument — these principles guide, they do not decide.',
      body: 'The Laws of UX are heuristics collected from psychology research and design practice. They are excellent for naming a problem in a review — “this violates Hick’s Law” ends a taste debate faster than “I don’t like it” — and poor as justification on their own.\n\nUse them three ways: as a checklist when a design feels off, as vocabulary in critiques and specs, and as a prior for defaults. Then verify with users, because every law has exceptions and the exceptions are where good design lives.',
      rules: [
        'Cite the law in design reviews to turn taste debates into principle debates.',
        'Treat them as defaults to test, not rules to obey.',
        'Combine laws deliberately: chunking (memory) plus progressive disclosure (choice) plus a fast response (Doherty) is a pattern, not three coincidences.',
        'When two laws conflict — Jakob’s familiarity versus Von Restorff’s differentiation — decide with user research, not alphabetically.',
        'Keep this page as a reference; the principles age slowly but the examples age fast.',
      ],
    },
  ],
};
