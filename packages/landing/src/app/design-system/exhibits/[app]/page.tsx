import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import { TopicTemplate } from '@/components/templates/TopicTemplate';
import {
  exhibitApps,
  exhibitAppsByCategory,
  exhibitCategoryTitle,
  getExhibitApp,
} from '@/content/ts/design-system';
import type { TopicSectionData } from '@/content/ts/types';
import { ExhibitDemo, type ExhibitDemoSlug } from '@/exhibit/demo';
import { withBasePath } from '@/lib/paths';

type Params = { app: string };

export const generateStaticParams: () => Params[] = () => {
  return exhibitApps.map((app) => ({ app: app.slug }));
};

export const generateMetadata: ({
  params,
}: {
  params: Promise<Params>;
}) => Promise<Metadata> = async ({ params }) => {
  const { app: slug } = await params;
  const app = getExhibitApp(slug);
  if (!app) return {};
  return {
    title: app.name,
    description: app.description,
    alternates: { canonical: withBasePath(`/design-system/exhibits/${app.slug}`) },
  };
};

const ExhibitPage: NextPage<{ params: Promise<Params> }> = async ({ params }) => {
  const { app: slug } = await params;
  const app = getExhibitApp(slug);
  if (!app) notFound();

  const index = exhibitApps.findIndex((a) => a.slug === slug);
  const prev = exhibitApps[(index - 1 + exhibitApps.length) % exhibitApps.length];
  const next = exhibitApps[(index + 1) % exhibitApps.length];

  const related = exhibitAppsByCategory(app.category).filter((a) => a.slug !== app.slug);

  const sections: TopicSectionData[] = [
    {
      id: 'demo',
      title: 'Live demo',
      intro:
        'The app itself, running in your browser — ported into this site and re-skinned to its tokens.',
      blocks: [{ type: 'demo', node: <ExhibitDemo slug={app.slug as ExhibitDemoSlug} /> }],
    },
    {
      id: 'takeaway',
      title: 'The design-system take',
      intro:
        'What the app teaches about building interfaces — the lesson to carry into your own work.',
      blocks: [
        { type: 'prose', text: app.takeaway },
        ...(app.liveUrl
          ? [
              {
                type: 'prose' as const,
                text: `Try the live app: [open ${app.name}](${app.liveUrl}).`,
              },
            ]
          : []),
      ],
    },
    {
      id: 'patterns',
      title: 'Patterns on display',
      intro: 'The chapters in this guide whose patterns the app demonstrates.',
      blocks: [
        {
          type: 'items',
          items: app.chapters.map((chapter) => ({
            title: chapter.title,
            body: chapter.note,
            href: `/design-system/${chapter.slug}`,
          })),
        },
      ],
    },
    {
      id: 'related',
      title: `More in ${exhibitCategoryTitle(app.category)}`,
      blocks: [
        {
          type: 'items',
          items: related.map((a) => ({
            title: `${a.name}${a.status === 'coming-soon' ? ' — coming soon' : ''}`,
            body: a.description,
            href: `/design-system/exhibits/${a.slug}`,
          })),
        },
      ],
    },
  ];

  return (
    <TopicTemplate
      theme='design-system'
      category={`Exhibits · ${exhibitCategoryTitle(app.category)}${app.status === 'coming-soon' ? ' · Coming soon' : ''}`}
      title={app.name}
      tagline={app.description}
      sections={sections}
      backLink={{ href: '/design-system/exhibits', label: 'All exhibits' }}
      footer={{
        prev: {
          href: `/design-system/exhibits/${prev.slug}`,
          title: prev.name,
          label: 'Previous exhibit',
        },
        next: {
          href: `/design-system/exhibits/${next.slug}`,
          title: next.name,
          label: 'Next exhibit',
        },
        backToIndex: { href: '/design-system', label: 'Back to chapters' },
      }}
    />
  );
};

export default ExhibitPage;
