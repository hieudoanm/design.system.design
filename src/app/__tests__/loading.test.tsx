import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loading from '@/app/loading';

describe('Loading', () => {
  it('tells the visitor to wait', () => {
    render(<Loading />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Please wait' })).toBeInTheDocument();
    expect(screen.getByText('Preparing your content...')).toBeInTheDocument();
  });
});
