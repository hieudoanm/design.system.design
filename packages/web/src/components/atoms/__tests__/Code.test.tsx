import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Code from '@/components/atoms/Code';

describe('Code', () => {
  it('renders the source inside pre and code', () => {
    const { container } = render(<Code>{'const a = 1;'}</Code>);
    const pre = container.querySelector('pre');
    const code = container.querySelector('code');
    expect(pre).toBeInTheDocument();
    expect(code).toHaveTextContent('const a = 1;');
  });

  it('renders a label when one is given', () => {
    render(<Code label='High-level design'>{'diagram'}</Code>);
    expect(screen.getByText('High-level design')).toBeInTheDocument();
  });

  it('renders no caption when there is no label', () => {
    const { container } = render(<Code>{'diagram'}</Code>);
    expect(container.querySelector('figcaption')).toBeNull();
  });
});
