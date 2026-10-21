import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import ThemeToggle from '@/components/atoms/ThemeToggle';

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.head.innerHTML = '';
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('names the theme it switches to', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Switch to the dark theme' })).toBeInTheDocument();
  });

  it('switches to the dark theme and remembers it', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to the light theme' })).toBeInTheDocument();
  });

  it('switches back to the light theme', async () => {
    document.documentElement.dataset.theme = 'dark';
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('moves the browser chrome colour with it', async () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);

    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('button'));

    expect(meta).toHaveAttribute('content', '#0e1116');
  });
});
