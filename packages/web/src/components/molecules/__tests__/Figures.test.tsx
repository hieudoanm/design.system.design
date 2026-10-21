import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Figures from '@/components/molecules/Figures';

const visuals = [
  { title: 'Colour ramp', caption: 'The six chart colours.', svg: '<svg id="ramp" />' },
  { title: 'Token table', table: { columns: ['Token'], rows: [['color-action-bg']] } },
  { title: 'Wide drawing', svg: '<svg id="wide" />', full: true },
];

describe('Figures', () => {
  it('renders one figure per visual', () => {
    const { container } = render(<Figures visuals={visuals} />);
    expect(container.querySelectorAll('figure')).toHaveLength(3);
    expect(screen.getByText('Colour ramp')).toBeInTheDocument();
    expect(screen.getByText('Token table')).toBeInTheDocument();
    expect(screen.getByText('Wide drawing')).toBeInTheDocument();
  });

  it('passes the caption and the drawing through', () => {
    const { container } = render(<Figures visuals={visuals} />);
    expect(screen.getByText('The six chart colours.')).toBeInTheDocument();
    expect(container.querySelector('#ramp')).toBeInTheDocument();
  });

  it('renders the table of a visual', () => {
    render(<Figures visuals={visuals} />);
    expect(screen.getByRole('columnheader', { name: 'Token' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'color-action-bg' })).toBeInTheDocument();
  });

  it('spans the full width for a full visual', () => {
    const { container } = render(<Figures visuals={visuals} />);
    const wrappers = container.querySelectorAll('.grid > div');
    expect(wrappers[0]).not.toHaveClass('xl:col-span-2');
    expect(wrappers[2]).toHaveClass('xl:col-span-2');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<Figures visuals={[]} />);
    expect(container.querySelectorAll('figure')).toHaveLength(0);
  });
});
