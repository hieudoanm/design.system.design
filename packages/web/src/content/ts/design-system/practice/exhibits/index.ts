import type { Topic } from '../index';
import { exhibitAppsByCategory, exhibitCategories } from './apps';

/*
 * The Exhibit apps are a working UI exhibition: nine showcase applications
 * (POS, wallet, tax, chat, AI chat, password, video, gallery, menu) built on
 * a shared atomic-design shell. Each app has its own page under
 * /design-system/exhibits/<slug>; this chapter is the index and the map
 * from app to the chapters that explain its patterns.
 */
export const exhibits: Topic = {
  slug: 'exhibits',
  title: 'Exhibits',
  tagline:
    'Nine working apps that show the chapters in this guide running in production — every pattern has a home you can open.',
  summary:
    'An exhibit is a small, complete application built to demonstrate interface patterns rather than to ship a product. Together the apps cover transactional UI, dense data tables, real-time messaging, generative interfaces and media tools — and each one is a worked example of the atoms, molecules and organisms this guide describes.',
  group: 'practice',
  sections: [
    {
      id: 'how-to-read',
      title: 'How to read the exhibits',
      intro:
        'Each exhibit is a complete app built on a shared shell — the same atoms, molecules and organisms repeated across very different domains.',
      body: 'Open an app and look for the same pieces everywhere: the transaction row in Wallet is the menu item in POS is the message in Chat. That repetition is the design system working — one component, many contexts.\n\nEach exhibit page names the chapters whose patterns the app demonstrates, so you can move between the theory and a working example in either direction.',
      rules: [
        'Start with Wallet — it is the largest app and exercises almost every pattern in the guide.',
        'Compare POS and Tax: both are transactional, but one optimises for speed and the other for auditability.',
        'The Menu exhibit is still coming soon; its page describes the patterns it will demonstrate.',
      ],
    },
    ...exhibitCategories.map((category) => ({
      id: category.id,
      title: category.title,
      intro: category.intro,
      blocks: [
        {
          type: 'items' as const,
          items: exhibitAppsByCategory(category.id).map((app) => ({
            title: `${app.name}${app.status === 'coming-soon' ? ' — coming soon' : ''}`,
            body: app.description,
            href: `/design-system/exhibits/${app.slug}`,
          })),
        },
      ],
    })),
  ],
};
