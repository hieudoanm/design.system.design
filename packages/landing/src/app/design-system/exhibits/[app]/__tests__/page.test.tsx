import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import ExhibitPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/design-system/exhibits/[app]/page';
import { exhibitApps, exhibitAppsByCategory, getExhibitApp } from '@/content/ts/design-system';

type PageProps = { params: Promise<{ app: string }> };

const page = ExhibitPage as unknown as (props: PageProps) => Promise<ReactNode>;

const renderExhibit = async (app: string) => {
  const element = await page({ params: Promise.resolve({ app }) });
  return render(element);
};

describe('generateStaticParams', () => {
  it('covers every exhibit app', () => {
    expect(generateStaticParams()).toEqual(exhibitApps.map((app) => ({ app: app.slug })));
  });
});

describe('generateMetadata', () => {
  it('describes a known app', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ app: 'wallet' }) });
    expect(metadata.title).toBe('Wallet');
    expect(metadata.description).toBe(getExhibitApp('wallet')?.description);
    expect(metadata.alternates?.canonical).toBe('/design-system/exhibits/wallet');
  });

  it('stays empty for an unknown app', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ app: 'nope' }) });
    expect(metadata).toEqual({});
  });
});

describe('ExhibitPage', () => {
  it('renders the app name and description', async () => {
    await renderExhibit('wallet');
    expect(screen.getByRole('heading', { level: 1, name: 'Wallet' })).toBeInTheDocument();
    expect(screen.getByText(getExhibitApp('wallet')!.description)).toBeInTheDocument();
  });

  it('renders the takeaway', async () => {
    await renderExhibit('pos');
    expect(screen.getByText(getExhibitApp('pos')!.takeaway)).toBeInTheDocument();
  });

  it('links to the chapters the app demonstrates', async () => {
    await renderExhibit('wallet');
    const app = getExhibitApp('wallet')!;
    app.chapters.forEach((chapter) => {
      const links = screen.getAllByRole('link', { name: chapter.title });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute('href', `/design-system/${chapter.slug}`);
    });
  });

  it('links to the other apps in the same category', async () => {
    await renderExhibit('wallet');
    const app = getExhibitApp('wallet')!;
    const siblings = exhibitAppsByCategory(app.category).filter((a) => a.slug !== app.slug);
    siblings.forEach((sibling) => {
      expect(
        screen.getAllByRole('link', { name: new RegExp(sibling.name) }).length,
      ).toBeGreaterThan(0);
    });
  });

  it('marks coming-soon apps in related links', async () => {
    await renderExhibit('pos');
    expect(screen.getByRole('link', { name: /Menu — coming soon/ })).toBeInTheDocument();
  });

  it('walks to the previous and next exhibit in reading order', async () => {
    await renderExhibit('pos');
    const index = exhibitApps.findIndex((a) => a.slug === 'pos');
    const prev = exhibitApps[(index - 1 + exhibitApps.length) % exhibitApps.length];
    const next = exhibitApps[(index + 1) % exhibitApps.length];
    expect(screen.getByRole('link', { name: /Previous exhibit/ })).toHaveAttribute(
      'href',
      `/design-system/exhibits/${prev.slug}`,
    );
    expect(screen.getByRole('link', { name: /Next exhibit/ })).toHaveAttribute(
      'href',
      `/design-system/exhibits/${next.slug}`,
    );
  });

  it('links back to the exhibits chapter and the chapter index', async () => {
    await renderExhibit('pos');
    expect(screen.getByRole('link', { name: /All exhibits/ })).toHaveAttribute(
      'href',
      '/design-system/exhibits',
    );
    expect(screen.getByRole('link', { name: /Back to chapters/ })).toHaveAttribute(
      'href',
      '/design-system',
    );
  });

  it('calls notFound for an unknown app', async () => {
    await expect(page({ params: Promise.resolve({ app: 'nope' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });
});
