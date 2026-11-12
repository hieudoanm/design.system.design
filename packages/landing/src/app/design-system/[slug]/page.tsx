import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import { TopicTemplate } from '@/components/templates/TopicTemplate';
import { getTopic, topics } from '@/content/ts/design-system';
import type { TopicBlock, TopicSection } from '@/content/ts/design-system';
import type { TopicSectionData } from '@/content/ts/types';
import { withBasePath } from '@/lib/paths';

type Params = { slug: string };

export const generateStaticParams: () => Params[] = () => {
  return topics.map((topic) => ({ slug: topic.slug }));
};

export const generateMetadata: ({
  params,
}: {
  params: Promise<Params>;
}) => Promise<Metadata> = async ({ params }) => {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return {
    title: topic.title,
    description: topic.tagline,
    alternates: { canonical: withBasePath(`/design-system/${slug}`) },
  };
};

/** Convert a section's flat legacy fields into ordered blocks. */
const legacyToBlocks = (section: TopicSection): TopicBlock[] => {
  const blocks: TopicBlock[] = [];

  if (section.body) blocks.push({ type: 'prose', text: section.body });
  if (section.items?.length) blocks.push({ type: 'items', items: section.items });
  if (section.examples?.length) blocks.push({ type: 'examples', examples: section.examples });
  if (section.rules?.length) blocks.push({ type: 'rules', rules: section.rules });
  if (section.code)
    blocks.push({ type: 'code', label: section.code.label, source: section.code.source });
  if (section.visuals?.length) blocks.push({ type: 'visuals', visuals: section.visuals });

  return blocks;
};

const DesignSystemTopicPage: NextPage<{ params: Promise<Params> }> = async ({ params }) => {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const index = topics.findIndex((t) => t.slug === slug);
  const prev = topics[(index - 1 + topics.length) % topics.length];
  const next = topics[(index + 1) % topics.length];

  const sections: TopicSectionData[] = topic.sections.map((section) => {
    const blocks: TopicBlock[] = section.blocks?.length
      ? [...section.blocks]
      : legacyToBlocks(section);

    // Visuals are a block too; append them when a section carries them outside `blocks`.
    if (section.visuals?.length && !blocks.some((block) => block.type === 'visuals')) {
      blocks.push({ type: 'visuals', visuals: section.visuals });
    }

    return { id: section.id, title: section.title, intro: section.intro, blocks };
  });

  return (
    <TopicTemplate
      theme='design-system'
      category={`Design System · ${index + 1} of ${topics.length}`}
      title={topic.title}
      tagline={topic.tagline}
      sections={sections}
      backLink={{ href: '/design-system', label: 'All chapters' }}
      footer={{
        prev: { href: `/design-system/${prev.slug}`, title: prev.title },
        next: { href: `/design-system/${next.slug}`, title: next.title },
        backToIndex: { href: '/design-system', label: 'Back to chapters' },
      }}
    />
  );
};

export default DesignSystemTopicPage;
