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
import { topics } from '@/content/design-system';

type PageProps = { params: Promise<{ slug: string }> };

const page = DesignSystemTopicPage as unknown as (props: PageProps) => Promise<ReactNode>;

const renderTopic = async (slug: string) => {
  const element = await page({ params: Promise.resolve({ slug }) });
  return render(element);
};

describe('generateStaticParams', () => {
  it('covers every topic', () => {
    expect(generateStaticParams()).toEqual(topics.map((topic) => ({ slug: topic.slug })));
  });
});

describe('generateMetadata', () => {
  it('describes a known topic', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'components' }) });
    expect(metadata.title).toBe('Components');
    expect(metadata.description).toBe(topics[0].tagline);
    expect(metadata.alternates?.canonical).toBe('/design-system/components');
  });

  it('stays empty for an unknown topic', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nope' }) });
    expect(metadata).toEqual({});
  });
});

describe('DesignSystemTopicPage', () => {
  it('renders the topic title and tagline', async () => {
    await renderTopic('components');
    expect(screen.getByRole('heading', { level: 1, name: 'Components' })).toBeInTheDocument();
    expect(screen.getByText(topics[0].tagline)).toBeInTheDocument();
  });

  it('numbers the topic in the reading order', async () => {
    await renderTopic('design-tokens');
    expect(screen.getByText('Design System · 2 of 6')).toBeInTheDocument();
  });

  it('links to every section in the table of contents', async () => {
    await renderTopic('components');
    const anchors = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#'));
    topics[0].sections.forEach((section) => expect(anchors).toContain(`#${section.id}`));
  });

  it('renders the body of a section', async () => {
    const { container } = await renderTopic('components');
    const section = topics[0].sections.find((s) => s.body);
    expect(section).toBeDefined();
    expect(container.textContent).toContain('Tokens come before atoms.');
  });

  it('renders the items, the examples and the rules of a section', async () => {
    await renderTopic('components');
    const withItems = topics[0].sections.find((s) => s.items);
    expect(withItems).toBeDefined();
    withItems?.items?.forEach((item) => expect(screen.getByText(item.title)).toBeInTheDocument());
    expect(screen.getAllByText('Examples').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rules').length).toBeGreaterThan(0);
  });

  it('wraps around to the last topic for the previous link', async () => {
    await renderTopic('components');
    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      `/design-system/${topics[topics.length - 1].slug}`,
    );
  });

  it('links to the next topic', async () => {
    await renderTopic('components');
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
