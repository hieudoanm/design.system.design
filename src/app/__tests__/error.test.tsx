import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

import ErrorPage from '@/app/error';

const error = Object.assign(new Error('boom'), { digest: '123' });

describe('Error', () => {
  it('logs the error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(spy).toHaveBeenCalledWith(error);
  });

  it('explains what happened', () => {
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
  });

  it('resets the route when the button is pressed', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<ErrorPage error={error} reset={reset} />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('links back home', () => {
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
  });
});
