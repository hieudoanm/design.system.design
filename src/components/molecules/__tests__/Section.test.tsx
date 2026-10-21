import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Section from '@/components/molecules/Section';

describe('Section', () => {
  it('renders the title, the id and the children', () => {
    render(
      <Section id='tokens' title='Design tokens'>
        <p>Body copy</p>
      </Section>,
    );
    const section = document.getElementById('tokens');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
    expect(screen.getByRole('heading', { level: 2, name: 'Design tokens' })).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it('renders the intro when one is given', () => {
    render(
      <Section id='tokens' title='Design tokens' intro='A short line.'>
        <p>Body copy</p>
      </Section>,
    );
    expect(screen.getByText('A short line.')).toBeInTheDocument();
  });

  it('renders no intro paragraph when there is none', () => {
    const { container } = render(
      <Section id='tokens' title='Design tokens'>
        <p>Body copy</p>
      </Section>,
    );
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });
});
