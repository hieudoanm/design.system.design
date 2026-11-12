import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NotFound from '@/app/not-found';

describe('NotFound', () => {
  it('says the page is missing', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('offers a way back to the two subjects', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Design System' })).toHaveAttribute(
      'href',
      '/design-system',
    );
    expect(screen.getByRole('link', { name: 'System Design' })).toHaveAttribute(
      'href',
      '/system-design',
    );
  });
});
