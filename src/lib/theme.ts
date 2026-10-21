/**
 * The theme is one attribute on the root element: `data-theme="dark"`.
 *
 * The inline script in the root layout sets it before the page paints, so
 * there is no flash. This module is the other half: it reads the attribute,
 * writes it, remembers the choice and tells the components that care.
 */

export type Theme = 'light' | 'dark';

/** The event the toggle fires when the theme changes. */
export const THEME_EVENT = 'theme:change';

/** Where the choice is remembered. */
export const THEME_KEY = 'theme';

/** The browser chrome colour for each theme. */
export const THEME_COLOR: Record<Theme, string> = {
  light: '#f2f4f1',
  dark: '#0e1116',
};

/** The theme the page is showing right now. */
export const readTheme = (): Theme =>
  typeof document === 'undefined' || document.documentElement.dataset.theme !== 'dark'
    ? 'light'
    : 'dark';

/**
 * Switches the theme: the attribute, the stored choice, the browser chrome
 * and the meta tag all move together.
 */
export const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode: the theme still holds for this page view.
  }

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);

  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
};
