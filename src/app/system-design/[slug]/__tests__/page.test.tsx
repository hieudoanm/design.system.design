import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import ProblemPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/system-design/[slug]/page';
import { problems } from '@/content/system-design';

type PageProps = { params: Promise<{ slug: string }> };

const page = ProblemPage as unknown as (props: PageProps) => Promise<ReactNode>;

const renderProblem = async (slug: string) => {
  const element = await page({ params: Promise.resolve({ slug }) });
  return render(element);
};

describe('generateStaticParams', () => {
  it('covers every problem', () => {
    expect(generateStaticParams()).toEqual(problems.map((problem) => ({ slug: problem.slug })));
  });
});

describe('generateMetadata', () => {
  it('describes a known problem', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'url-shortener' }),
    });
    expect(metadata.title).toBe('Design URL shortener');
    expect(metadata.description).toBe(problems[0].tagline);
    expect(metadata.alternates?.canonical).toBe('/system-design/url-shortener');
  });

  it('stays empty for an unknown problem', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nope' }) });
    expect(metadata).toEqual({});
  });
});

describe('ProblemPage', () => {
  it('renders the problem title and tagline', async () => {
    await renderProblem('url-shortener');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Design a url shortener' }),
    ).toBeInTheDocument();
    expect(screen.getByText(problems[0].tagline)).toBeInTheDocument();
  });

  it('shows the difficulty', async () => {
    await renderProblem('url-shortener');
    expect(screen.getByText(`System Design · ${problems[0].difficulty}`)).toBeInTheDocument();
  });

  it('splits the requirements into functional and non-functional', async () => {
    await renderProblem('url-shortener');
    expect(screen.getByText('Functional')).toBeInTheDocument();
    expect(screen.getByText('Non-functional')).toBeInTheDocument();
    problems[0].functional.forEach((requirement) =>
      expect(screen.getByText(requirement)).toBeInTheDocument(),
    );
    problems[0].nonFunctional.forEach((requirement) =>
      expect(screen.getByText(requirement)).toBeInTheDocument(),
    );
  });

  it('lists the estimation numbers', async () => {
    await renderProblem('url-shortener');
    problems[0].estimation.forEach((number) =>
      expect(screen.getByText(number)).toBeInTheDocument(),
    );
  });

  it('renders the architecture diagram', async () => {
    const { container } = await renderProblem('url-shortener');
    expect(screen.getByText('High-level design')).toBeInTheDocument();
    expect(container.querySelector('code')?.textContent).toBe(problems[0].diagram);
  });

  it('renders the design decisions', async () => {
    await renderProblem('url-shortener');
    problems[0].design.forEach((block) =>
      expect(screen.getByRole('heading', { level: 3, name: block.title })).toBeInTheDocument(),
    );
  });

  it('renders the questions and answers', async () => {
    await renderProblem('url-shortener');
    expect(screen.getByText(problems[0].qa[0].q)).toBeInTheDocument();
    expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
  });

  it('links to the next problem and wraps around', async () => {
    await renderProblem('url-shortener');
    expect(screen.getByRole('link', { name: /Next problem/ })).toHaveAttribute(
      'href',
      `/system-design/${problems[1].slug}`,
    );

    await renderProblem(problems[problems.length - 1].slug);
    const links = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(links).toContain(`/system-design/${problems[0].slug}`);
  });

  it('calls notFound for an unknown problem', async () => {
    await expect(page({ params: Promise.resolve({ slug: 'nope' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });
});
