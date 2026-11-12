import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { pathnameRef, basePathRef } = vi.hoisted(() => ({
  pathnameRef: { current: '/' },
  basePathRef: { current: '' },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameRef.current,
}));

vi.mock('@/lib/paths', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/paths')>();
  return {
    ...actual,
    get basePath() {
      return basePathRef.current;
    },
  };
});

import Navbar from '@/components/organisms/Navbar';

const pill = () => document.querySelector('.toggle-pill') as HTMLElement;
const pillClass = () => pill().parentElement?.className ?? '';

beforeEach(() => {
  pathnameRef.current = '/';
  basePathRef.current = '';
});

describe('Navbar', () => {
  it('renders the three toggle links', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Design System')).toHaveAttribute('href', '/design-system');
    expect(screen.getByLabelText('System (home)')).toHaveAttribute('href', '/');
    expect(screen.getByLabelText('System Design')).toHaveAttribute('href', '/system-design');
  });

  it('marks the current page', () => {
    pathnameRef.current = '/design-system';
    render(<Navbar />);
    expect(screen.getByLabelText('Design System')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText('System Design')).not.toHaveAttribute('aria-current');
  });

  it('lights the middle button on the landing page', () => {
    pathnameRef.current = '/';
    render(<Navbar />);
    expect(pill()).toHaveStyle({ left: '33.33333333333333%', width: '33.33333333333333%' });
    // jsdom cannot resolve var() in computed style, so check the inline value.
    expect(pill().style.backgroundColor).toBe('var(--pill-bg)');
    expect(pillClass()).toContain('pill-landing');
    expect(screen.getByLabelText('System (home)')).toHaveClass('[color:var(--pill-fg)]');
    expect(screen.getByLabelText('Design System')).toHaveClass('text-ink/60');
  });

  it('lights the left and middle buttons on a design system page', () => {
    pathnameRef.current = '/design-system';
    render(<Navbar />);
    expect(pill()).toHaveStyle({ left: '0%', width: '66.66666666666666%' });
    expect(pillClass()).toContain('pill-design-system');
    expect(screen.getByLabelText('Design System')).toHaveClass('[color:var(--pill-fg)]');
    expect(screen.getByLabelText('System (home)')).toHaveClass('[color:var(--pill-fg)]');
    expect(screen.getByLabelText('System Design')).toHaveClass('text-ink/60');
  });

  it('lights the middle and right buttons on a system design page', () => {
    pathnameRef.current = '/system-design';
    render(<Navbar />);
    expect(pill()).toHaveStyle({ left: '33.33333333333333%', width: '66.66666666666666%' });
    expect(pillClass()).toContain('pill-system-design');
    expect(screen.getByLabelText('System (home)')).toHaveClass('[color:var(--pill-fg)]');
    expect(screen.getByLabelText('System Design')).toHaveClass('[color:var(--pill-fg)]');
    expect(screen.getByLabelText('Design System')).toHaveClass('text-ink/60');
  });

  it('strips the base path before it looks at the route', () => {
    basePathRef.current = '/design.system.design';
    pathnameRef.current = '/design.system.design/system-design';
    render(<Navbar />);
    expect(screen.getByLabelText('System Design')).toHaveAttribute('aria-current', 'page');
    expect(pillClass()).toContain('pill-system-design');
  });

  it('moves the highlight on click, before the route changes', async () => {
    pathnameRef.current = '/';
    const user = userEvent.setup();
    render(<Navbar />);
    const link = screen.getByLabelText('System Design');
    // Keep jsdom from trying to follow the link.
    link.addEventListener('click', (event) => event.preventDefault());
    await user.click(link);
    expect(pillClass()).toContain('pill-system-design');
    expect(screen.getByLabelText('System Design')).toHaveClass('[color:var(--pill-fg)]');
  });
});
