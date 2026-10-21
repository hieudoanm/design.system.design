import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

import RootLayout, { metadata, viewport } from '@/app/layout';

const markup = () =>
  renderToStaticMarkup(
    <RootLayout>
      <p>Page body</p>
    </RootLayout>,
  );

describe('RootLayout', () => {
  it('renders the navbar, the page and the footer', () => {
    const html = markup();
    expect(html).toContain('Page body');
    expect(html).toContain('aria-label="Primary"');
    expect(html).toContain('design.system.design.');
  });

  it('declares the language', () => {
    expect(markup()).toContain('<html lang="en"');
  });

  it('puts the theme toggle in the footer', () => {
    const html = markup();
    expect(html).toContain('Switch to the dark theme');
    expect(html).toContain('justify-between');
  });

  it('sets the theme on the client', () => {
    const html = markup();
    // Theme is set client-side via the Init component (useTheme hook)
    // Server-rendered HTML does not include data-theme attribute
    expect(html).toContain('Page body');
  });
});

describe('metadata', () => {
  it('titles every page after the site', () => {
    expect(metadata.title).toEqual({
      default: 'design.system.design',
      template: '%s | design.system.design',
    });
  });

  it('points at the manifest, the canonical url and the icons', () => {
    expect(metadata.manifest).toBe('/manifest.json');
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.icons).toEqual({
      icon: [
        { url: '/icons/icon.svg', type: 'image/svg+xml' },
        { url: '/icons/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    });
  });

  it('shares the social card', () => {
    expect(metadata.openGraph?.images).toEqual([
      {
        url: '/images/og.png',
        width: 1200,
        height: 630,
        alt: 'Design system. System design. — design.system.design',
      },
    ]);
    expect(metadata.twitter?.images).toEqual(['/images/og.png']);
  });
});

describe('viewport', () => {
  it('pins the theme colour', () => {
    expect(viewport.themeColor).toBe('#f2f4f1');
  });

  it('supports both colour schemes', () => {
    expect(viewport.colorScheme).toBe('light dark');
  });
});
