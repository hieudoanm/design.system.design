import { topicGroups, topicsByGroup } from '@/content/ts/design-system';
import type { NextPage } from 'next';
import { TopicIndexTemplate } from '@/components/templates/TopicsTemplate';

const style = {
  eyebrowClass: 'text-marker',
  hoverBorderClass: 'hover:border-marker',
  badgeTextClass: 'text-marker',
  badgeBgClass: 'bg-marker/10',
  tagClass: 'text-marker bg-marker/10 rounded-full px-2.5 py-0.5 font-mono text-xs',
  eyebrowColorClass: 'text-marker',
} as const;

const DesignSystemPage: NextPage = () => (
  <TopicIndexTemplate
    header={{
      eyebrow: 'Design System',
      title: 'Build it in layers, from tokens to pages.',
      description:
        'A design system is a set of tokens, components and guidelines that lets many people build a consistent product quickly. These twenty-five chapters, in six groups, cover the layers it is built from and the concerns that keep it healthy.',
    }}
    groups={topicGroups}
    itemsByGroupId={Object.fromEntries(
      topicGroups.map((group) => [group.id, topicsByGroup(group.id)]),
    )}
    basePath='/design-system'
    style={style}
    itemLabel={{ singular: 'chapter', plural: 'chapters' }}
    eyebrowClass='text-marker'
    color='marker'
  />
);

export default DesignSystemPage;
