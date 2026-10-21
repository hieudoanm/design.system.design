import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '@/app/page';
import { problems } from '@/content/system-design';
import { topics } from '@/content/design-system';

describe('Home', () => {
  it('introduces the two subjects', () => {
    render(<Home />);
    expect(screen.getByText('Two subjects, one word apart')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Design system.');
    expect(heading).toHaveTextContent('System design.');
  });

  it('links to the design system chapter', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /Design System/ });
    expect(link).toHaveAttribute('href', '/design-system');
  });

  it('links to the system design problems', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /System Design/ });
    expect(link).toHaveAttribute('href', '/system-design');
  });

  it('lists every topic and problem on the cards', () => {
    render(<Home />);
    const items = screen.getAllByRole('listitem').map((item) => item.textContent ?? '');
    topics.forEach((topic, i) => expect(items).toContain(`${i + 1}. ${topic.title}`));
    problems.forEach((problem) => expect(items).toContain(problem.title));
  });

  it('numbers the design system topics but not the problems', () => {
    render(<Home />);
    const items = screen.getAllByRole('listitem').map((item) => item.textContent ?? '');
    expect(items).toContain(`1. ${topics[0].title}`);
    expect(items).not.toContain(`1. ${problems[0].title}`);
  });
});
