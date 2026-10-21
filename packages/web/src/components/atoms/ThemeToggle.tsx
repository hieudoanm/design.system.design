'use client';

import { applyTheme, readTheme, type Theme } from '@/lib/theme';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

/** The sun: the theme you switch to from the dark one. */
const Sun: FC = () => (
  <svg
    viewBox='0 0 24 24'
    width='14'
    height='14'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    aria-hidden='true'>
    <circle cx='12' cy='12' r='4' />
    <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
  </svg>
);

/** The moon: the theme you switch to from the light one. */
const Moon: FC = () => (
  <svg
    viewBox='0 0 24 24'
    width='14'
    height='14'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'>
    <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
  </svg>
);

/**
 * The theme switch in the footer.
 *
 * The button names the theme it switches to, so it reads as an action. The
 * root layout sets the theme before the page paints, so this only has to keep
 * up with the choice.
 */
const ThemeToggle: FC = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const dark = theme === 'dark';
  const next: Theme = dark ? 'light' : 'dark';

  return (
    <button
      type='button'
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
      aria-label={`Switch to the ${next} theme`}
      title={`Switch to the ${next} theme`}
      className='glass text-ink hover:text-ink inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors'>
      {dark ? <Sun /> : <Moon />}
      <span>{next === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;
