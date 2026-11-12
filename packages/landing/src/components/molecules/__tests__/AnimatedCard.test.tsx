import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AnimatedCard from '@/components/molecules/AnimatedCard';

const items = [
  { slug: 'tokens', title: 'Design tokens' },
  { slug: 'fonts', title: 'Typography' },
];

describe('AnimatedCard', () => {
  it('renders the label, title and description', () => {
    render(
      <AnimatedCard
        href='/design-system'
        label='Left toggle'
        title='Design System'
        description='A practical guide.'
        items={items}
        color='marker'
        index={0}
      />,
    );
    expect(screen.getByText('Left toggle')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Design System' })).toBeInTheDocument();
    expect(screen.getByText('A practical guide.')).toBeInTheDocument();
  });

  it('links to the given href', () => {
    render(
      <AnimatedCard
        href='/design-system'
        label='Left toggle'
        title='Design System'
        description='A practical guide.'
        items={items}
        color='marker'
        index={0}
      />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/design-system');
  });

  it('renders the items without numbers', () => {
    render(
      <AnimatedCard
        href='/design-system'
        label='Left toggle'
        title='Design System'
        description='A practical guide.'
        items={items}
        color='marker'
        index={0}
      />,
    );
    const list = screen.getAllByRole('listitem');
    expect(list[0]).toHaveTextContent('Design tokens');
    expect(list[1]).toHaveTextContent('Typography');
  });

  it('uses the marker colour when asked', () => {
    render(
      <AnimatedCard
        href='/design-system'
        label='Left toggle'
        title='Design System'
        description='A practical guide.'
        items={items}
        color='marker'
        index={0}
      />,
    );
    expect(screen.getByText('Left toggle')).toHaveClass('text-marker');
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('bg-marker/10');
  });

  it('uses the cobalt colour when asked', () => {
    render(
      <AnimatedCard
        href='/system-design'
        label='Right toggle'
        title='System Design'
        description='Interview problems.'
        items={items}
        color='cobalt'
        index={1}
      />,
    );
    expect(screen.getByText('Right toggle')).toHaveClass('text-cobalt');
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('bg-cobalt/10');
  });
});
