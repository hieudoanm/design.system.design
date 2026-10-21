import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DesignSystemPage, { metadata } from '@/app/design-system/page';
import { topics } from '@/content/design-system';

const hrefs = () => screen.getAllByRole('link').map((link) => link.getAttribute('href') ?? '');

describe('DesignSystemPage', () => {
  it('titles the page', () => {
    expect(metadata.title).toBe('Design System');
    expect(metadata.alternates?.canonical).toBe('/design-system');
  });

  it('links a card to every topic', () => {
    render(<DesignSystemPage />);
    topics.forEach((topic) => expect(hrefs()).toContain(`/design-system/${topic.slug}`));
  });

  it('shows the tagline of a topic', () => {
    render(<DesignSystemPage />);
    expect(screen.getAllByText(topics[0].tagline).length).toBeGreaterThan(0);
  });

  it('lists the sections of a topic', () => {
    render(<DesignSystemPage />);
    topics[0].sections.forEach((section) => {
      expect(screen.getAllByText(section.title).length).toBeGreaterThan(0);
    });
  });
});
