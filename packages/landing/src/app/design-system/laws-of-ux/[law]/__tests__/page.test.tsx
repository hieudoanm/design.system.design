import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import LawPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/design-system/laws-of-ux/[law]/page';
import { getLaw, uxLaws } from '@/content/ts/design-system';

type PageProps = { params: Promise<{ law: string }> };

const page = LawPage as unknown as (props: PageProps) => Promise<ReactNode>;

const renderLaw = async (law: string) => {
  const element = await page({ params: Promise.resolve({ law }) });
  return render(element);
};

describe('generateStaticParams', () => {
  it('covers every law', () => {
    expect(generateStaticParams()).toEqual(uxLaws.map((law) => ({ law: law.slug })));
  });
});

describe('generateMetadata', () => {
  it('describes a known law', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ law: 'hicks-law' }) });
    expect(metadata.title).toBe("Hick's Law");
    expect(metadata.description).toBe(getLaw('hicks-law')?.definition);
    expect(metadata.alternates?.canonical).toBe('/design-system/laws-of-ux/hicks-law');
  });

  it('stays empty for an unknown law', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ law: 'nope' }) });
    expect(metadata).toEqual({});
  });
});

describe('LawPage', () => {
  it('renders the law name and definition', async () => {
    await renderLaw('hicks-law');
    expect(screen.getByRole('heading', { level: 1, name: "Hick's Law" })).toBeInTheDocument();
    expect(screen.getByText(getLaw('hicks-law')!.definition)).toBeInTheDocument();
  });

  it('renders the takeaway and the source link', async () => {
    await renderLaw('hicks-law');
    expect(screen.getByText(getLaw('hicks-law')!.takeaway)).toBeInTheDocument();
    const source = screen.getByRole('link', { name: /Laws of UX/ });
    expect(source).toHaveAttribute('href', 'https://lawsofux.com/hicks-law/');
  });

  it('links to the other laws in the same group', async () => {
    await renderLaw('hicks-law');
    const law = getLaw('hicks-law')!;
    const siblings = uxLaws.filter((l) => l.group === law.group && l.slug !== law.slug);
    siblings.forEach((sibling) => {
      expect(screen.getAllByRole('link', { name: sibling.name }).length).toBeGreaterThan(0);
    });
  });

  it('walks to the previous and next law in reading order', async () => {
    await renderLaw('hicks-law');
    const index = uxLaws.findIndex((l) => l.slug === 'hicks-law');
    const prev = uxLaws[(index - 1 + uxLaws.length) % uxLaws.length];
    const next = uxLaws[(index + 1) % uxLaws.length];
    expect(screen.getByRole('link', { name: /Previous law/ })).toHaveAttribute(
      'href',
      `/design-system/laws-of-ux/${prev.slug}`,
    );
    expect(screen.getByRole('link', { name: /Next law/ })).toHaveAttribute(
      'href',
      `/design-system/laws-of-ux/${next.slug}`,
    );
  });

  it('links back to the laws chapter and the chapter index', async () => {
    await renderLaw('hicks-law');
    expect(screen.getByRole('link', { name: /All laws/ })).toHaveAttribute(
      'href',
      '/design-system/laws-of-ux',
    );
    expect(screen.getByRole('link', { name: /Back to chapters/ })).toHaveAttribute(
      'href',
      '/design-system',
    );
  });

  it('calls notFound for an unknown law', async () => {
    await expect(page({ params: Promise.resolve({ law: 'nope' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });
});
