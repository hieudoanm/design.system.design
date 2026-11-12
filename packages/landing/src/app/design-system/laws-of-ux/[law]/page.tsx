import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import { TopicTemplate } from '@/components/templates/TopicTemplate';
import { getLaw, lawGroupTitle, lawsByGroup, uxLaws } from '@/content/ts/design-system';
import type { TopicSectionData } from '@/content/ts/types';
import { withBasePath } from '@/lib/paths';

type Params = { law: string };

export const generateStaticParams: () => Params[] = () => {
  return uxLaws.map((law) => ({ law: law.slug }));
};

export const generateMetadata: ({
  params,
}: {
  params: Promise<Params>;
}) => Promise<Metadata> = async ({ params }) => {
  const { law: slug } = await params;
  const law = getLaw(slug);
  if (!law) return {};
  return {
    title: law.name,
    description: law.definition,
    alternates: { canonical: withBasePath(`/design-system/laws-of-ux/${law.slug}`) },
  };
};

const LawPage: NextPage<{ params: Promise<Params> }> = async ({ params }) => {
  const { law: slug } = await params;
  const law = getLaw(slug);
  if (!law) notFound();

  const index = uxLaws.findIndex((l) => l.slug === slug);
  const prev = uxLaws[(index - 1 + uxLaws.length) % uxLaws.length];
  const next = uxLaws[(index + 1) % uxLaws.length];

  const related = lawsByGroup(law.group).filter((l) => l.slug !== law.slug);

  const sections: TopicSectionData[] = [
    {
      id: 'takeaway',
      title: 'The design-system take',
      intro: 'Where the principle shows up in a token, component or pattern decision.',
      blocks: [
        { type: 'prose', text: law.takeaway },
        {
          type: 'prose',
          text: `Adapted from [${law.name} on Laws of UX](${law.source}) — Jon Yablonski.`,
        },
      ],
    },
    {
      id: 'related',
      title: `More in ${lawGroupTitle(law.group)}`,
      blocks: [
        {
          type: 'items',
          items: related.map((l) => ({
            title: l.name,
            body: l.definition,
            href: `/design-system/laws-of-ux/${l.slug}`,
          })),
        },
      ],
    },
  ];

  return (
    <TopicTemplate
      theme='design-system'
      category={`Laws of UX · ${lawGroupTitle(law.group)}`}
      title={law.name}
      tagline={law.definition}
      sections={sections}
      backLink={{ href: '/design-system/laws-of-ux', label: 'All laws' }}
      footer={{
        prev: {
          href: `/design-system/laws-of-ux/${prev.slug}`,
          title: prev.name,
          label: 'Previous law',
        },
        next: {
          href: `/design-system/laws-of-ux/${next.slug}`,
          title: next.name,
          label: 'Next law',
        },
        backToIndex: { href: '/design-system', label: 'Back to chapters' },
      }}
    />
  );
};

export default LawPage;
