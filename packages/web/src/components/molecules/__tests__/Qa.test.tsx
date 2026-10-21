import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Qa from '@/components/molecules/Qa';

const items = [
  { q: 'Why tokens?', a: 'Because **consistency** matters.' },
  { q: 'Why components?', a: 'Reuse beats copy paste.' },
];

describe('Qa', () => {
  it('renders one details element per question', () => {
    const { container } = render(<Qa items={items} />);
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(2);
    expect(screen.getByText('Why tokens?')).toBeInTheDocument();
    expect(screen.getByText('Why components?')).toBeInTheDocument();
  });

  it('renders the answer body', () => {
    render(<Qa items={items} />);
    expect(screen.getByText('Because', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Reuse beats copy paste.')).toBeInTheDocument();
  });

  it('renders the answer as rich text', () => {
    const { container } = render(<Qa items={items} />);
    expect(container.querySelector('strong')).toHaveTextContent('consistency');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<Qa items={[]} />);
    expect(container.querySelectorAll('details')).toHaveLength(0);
  });
});
