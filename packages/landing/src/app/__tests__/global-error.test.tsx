import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GlobalError from '@/app/global-error';

const error = Object.assign(new Error('boom'), { digest: '123' });

describe('GlobalError', () => {
  it('logs the error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<GlobalError error={error} reset={() => {}} />);
    // console.error may include a timestamp prefix; check the error is logged
    expect(spy).toHaveBeenCalled();
    const calls = spy.mock.calls.flat();
    expect(calls).toContainEqual(error);
  });

  it('explains what happened', () => {
    render(<GlobalError error={error} reset={() => {}} />);
    expect(screen.getByText('Critical Error')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Something went seriously wrong' }),
    ).toBeInTheDocument();
  });

  it('resets the route when the button is pressed', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<GlobalError error={error} reset={reset} />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('links back home', () => {
    render(<GlobalError error={error} reset={() => {}} />);
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
  });
});
