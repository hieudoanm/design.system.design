import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import DesignSystemTopicPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/design-system/[slug]/page';
import { topics } from '@/content/ts/design-system';
import type { TopicBlock } from '@/content/ts/design-system';

type PageProps = { params: Promise<{ slug: string }> };

const page = DesignSystemTopicPage as unknown as (props: PageProps) => Promise<ReactNode>;

const renderTopic = async (slug: string) => {
  const element = await page({ params: Promise.resolve({ slug }) });
  return render(element);
};

const findBlock = <T extends TopicBlock['type']>(
  blocks: TopicBlock[] | undefined,
  type: T,
): Extract<TopicBlock, { type: T }> | undefined =>
  blocks?.find((b): b is Extract<TopicBlock, { type: T }> => b.type === type);

describe('generateStaticParams', () => {
  it('covers every topic', () => {
    expect(generateStaticParams()).toEqual(topics.map((topic) => ({ slug: topic.slug })));
  });
});

describe('generateMetadata', () => {
  it('describes a known topic', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'atomic-design' }) });
    expect(metadata.title).toBe('Atomic Design');
    expect(metadata.description).toBe(
      topics.find((topic) => topic.slug === 'atomic-design')?.tagline,
    );
    expect(metadata.alternates?.canonical).toBe('/design-system/atomic-design');
  });

  it('stays empty for an unknown topic', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nope' }) });
    expect(metadata).toEqual({});
  });
});

describe('DesignSystemTopicPage', () => {
  it('renders the topic title and tagline', async () => {
    await renderTopic('design-tokens');
    expect(screen.getByRole('heading', { level: 1, name: 'Design tokens' })).toBeInTheDocument();
    expect(screen.getByText(topics[0].tagline)).toBeInTheDocument();
  });

  it('numbers the topic in the reading order', async () => {
    await renderTopic('colors');
    expect(screen.getByText(`Design System · 2 of ${topics.length}`)).toBeInTheDocument();
  });

  it('links to every section in the table of contents', async () => {
    await renderTopic('design-tokens');
    const anchors = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#'));
    topics[0].sections.forEach((section) => expect(anchors).toContain(`#${section.id}`));
  });

  it('renders the body of a section via blocks', async () => {
    const { container } = await renderTopic('design-tokens');
    const section = topics[0].sections[0];
    const proseBlock = findBlock(section.blocks, 'prose');
    expect(proseBlock).toBeDefined();
    expect(container.textContent).toContain(
      'is a raw value with no opinion about where it is used',
    );
  });

  it('renders the examples and the rules of a section via blocks', async () => {
    await renderTopic('design-tokens');
    const section = topics[0].sections[0];
    const examplesBlock = findBlock(section.blocks, 'examples');
    const rulesBlock = findBlock(section.blocks, 'rules');
    expect(examplesBlock).toBeDefined();
    expect(rulesBlock).toBeDefined();
    expect(screen.getAllByText('Examples').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rules').length).toBeGreaterThan(0);
  });

  it('renders items blocks in a later section', async () => {
    await renderTopic('design-tokens');
    const itemsSection = topics[0].sections.find((s) => s.blocks?.some((b) => b.type === 'items'));
    expect(itemsSection).toBeDefined();
    const itemsBlock = findBlock(itemsSection!.blocks, 'items');
    expect(itemsBlock).toBeDefined();
    itemsBlock?.items?.forEach((item) => expect(screen.getByText(item.title)).toBeInTheDocument());
  });

  it('renders code blocks inline', async () => {
    await renderTopic('design-tokens');
    const section = topics[0].sections[0];
    const codeBlock = findBlock(section.blocks, 'code');
    expect(codeBlock).toBeDefined();
    expect(screen.getByText('tokens/tokens.json')).toBeInTheDocument();
  });

  it('wraps around to the last topic for the previous link', async () => {
    await renderTopic('design-tokens');
    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      `/design-system/${topics[topics.length - 1].slug}`,
    );
  });

  it('links to the next topic', async () => {
    await renderTopic('design-tokens');
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      `/design-system/${topics[1].slug}`,
    );
  });

  it('calls notFound for an unknown topic', async () => {
    await expect(page({ params: Promise.resolve({ slug: 'nope' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });
});
