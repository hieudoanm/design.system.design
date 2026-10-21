import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Figure from '@/components/atoms/Figure';

const table = {
  columns: ['Token', 'Value'],
  rows: [
    ['color-action-bg', 'blue-600'],
    ['color-action-fg', 'white'],
  ],
};

describe('Figure', () => {
  it('renders the title', () => {
    render(<Figure title='Colour ramp' />);
    expect(screen.getByText('Colour ramp')).toBeInTheDocument();
  });

  it('renders the caption when there is one', () => {
    render(<Figure title='Colour ramp' caption='The six chart colours.' />);
    expect(screen.getByText('The six chart colours.')).toBeInTheDocument();
  });

  it('renders no caption when there is none', () => {
    const { container } = render(<Figure title='Colour ramp' />);
    expect(container.querySelector('figcaption p')).toBeNull();
  });

  it('renders the drawing', () => {
    const { container } = render(
      <Figure
        title='Colour ramp'
        svg='<svg viewBox="0 0 10 10"><rect width="10" height="10" /></svg>'
      />,
    );
    const drawing = container.querySelector('svg');
    expect(drawing).toBeInTheDocument();
    expect(drawing).toHaveAttribute('viewBox', '0 0 10 10');
  });

  it('renders the drawing inside a scroll box with the given width', () => {
    const { container } = render(
      <Figure title='Colour ramp' svg='<svg />' minWidth={640} maxWidth={900} />,
    );
    const box = container.querySelector('.overflow-x-auto > div') as HTMLElement;
    expect(box).toHaveStyle({ minWidth: '640px', maxWidth: '900px' });
  });

  it('renders the table behind the drawing', () => {
    render(<Figure title='Colour ramp' table={table} />);
    expect(screen.getByRole('columnheader', { name: 'Token' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Value' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'color-action-bg' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('collapses the table behind its summary when it has one', () => {
    const { container } = render(
      <Figure title='Colour ramp' table={{ ...table, summary: 'Show the tokens' }} />,
    );
    expect(container.querySelector('details')).toBeInTheDocument();
    expect(screen.getByText('Show the tokens')).toBeInTheDocument();
  });

  it('leaves the table open when it has no summary', () => {
    const { container } = render(<Figure title='Colour ramp' table={table} />);
    expect(container.querySelector('details')).toBeNull();
  });

  it('renders no table when there is none', () => {
    const { container } = render(<Figure title='Colour ramp' />);
    expect(container.querySelector('table')).toBeNull();
  });
});
