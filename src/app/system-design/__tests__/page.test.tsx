import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SystemDesignPage, { metadata } from '@/app/system-design/page';
import { framework, problems, problemGroups, problemsByGroup } from '@/content/ts/system-design';

describe('SystemDesignPage', () => {
  it('titles the page', () => {
    expect(metadata.title).toBe('System Design');
    expect(metadata.alternates?.canonical).toBe('/system-design');
  });

  it('groups the problems under six headings of four', () => {
    render(<SystemDesignPage />);
    problemGroups.forEach((group) => {
      expect(screen.getByRole('heading', { level: 2, name: group.title })).toBeInTheDocument();
    });
    expect(problemGroups).toHaveLength(6);
    problemGroups.forEach((group) => expect(problemsByGroup(group.id)).toHaveLength(4));
  });

  it('lists a card per problem', () => {
    render(<SystemDesignPage />);
    problems.forEach((problem) => {
      expect(screen.getByRole('link', { name: new RegExp(problem.title) })).toHaveAttribute(
        'href',
        `/system-design/${problem.slug}`,
      );
    });
  });

  it('shows the difficulty and the tags of a problem', () => {
    render(<SystemDesignPage />);
    const card = screen.getByRole('link', { name: new RegExp(problems[0].title) });
    expect(within(card).getByText(problems[0].difficulty)).toBeInTheDocument();
    problems[0].tags.forEach((tag) => expect(within(card).getByText(tag)).toBeInTheDocument());
  });

  it('lists the interview framework', () => {
    render(<SystemDesignPage />);
    expect(framework).toHaveLength(6);
    framework.forEach((item) => expect(screen.getByText(item.step)).toBeInTheDocument());
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('06')).toBeInTheDocument();
  });
});
