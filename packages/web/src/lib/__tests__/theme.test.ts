import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyTheme, readTheme, THEME_COLOR, THEME_EVENT, THEME_KEY } from '@/lib/theme';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.head.innerHTML = '';
  localStorage.clear();
});

describe('readTheme', () => {
  it('is light without the attribute', () => {
    expect(readTheme()).toBe('light');
  });

  it('is dark with it', () => {
    document.documentElement.dataset.theme = 'dark';
    expect(readTheme()).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('sets the attribute on the root', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('remembers the choice', () => {
    applyTheme('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('moves the browser chrome colour', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);

    applyTheme('dark');

    expect(meta).toHaveAttribute('content', THEME_COLOR.dark);
  });

  it('tells the components that care', () => {
    const listener = vi.fn();
    window.addEventListener(THEME_EVENT, listener);

    applyTheme('dark');

    expect(listener).toHaveBeenCalled();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toBe('dark');
    window.removeEventListener(THEME_EVENT, listener);
  });

  it('survives a browser that will not store anything', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(() => applyTheme('dark')).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe('dark');

    setItem.mockRestore();
  });
});
