import Navbar from '@/components/organisms/Navbar';
import Init from '@/components/atoms/Init';
import ThemeToggle from '@/components/atoms/ThemeToggle';
import { withBasePath } from '@/lib/paths';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/jetbrains-mono';
import { MotionConfig } from 'motion/react';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import type { FC } from 'react';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'http://localhost:3000';

const SITE_DESCRIPTION =
  'Two subjects that share a word: how to build a design system with atomic design, and how to answer system design interview questions.';

/*
 * Runs before the page paints: picks the stored theme, falls back to the
 * system setting, then sets data-theme and the browser chrome colour. The
 * colours are THEME_COLOR in src/lib/theme.ts — keep them in sync.
 */
const THEME_INIT = `try {
  var t = localStorage.getItem('theme');
  if (t !== 'dark' && t !== 'light') {
    t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = t;
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', t === 'dark' ? '#0e1116' : '#f2f4f1');
} catch (e) {}`;

export const metadata: Metadata = {
  // Next joins `metadataBase.pathname` with every relative metadata URL, so
  // the base stays on the origin and the paths carry the prefix themselves.
  metadataBase: new URL(siteOrigin),
  title: {
    default: 'design.system.design',
    template: '%s | design.system.design',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'design.system.design',
  manifest: withBasePath('/manifest.json'),
  alternates: { canonical: withBasePath('/') },
  icons: {
    icon: [
      { url: withBasePath('/icons/icon.svg'), type: 'image/svg+xml' },
      { url: withBasePath('/icons/favicon.ico'), sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
    ],
    apple: [{ url: withBasePath('/icons/apple-touch-icon.png'), sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en',
    url: withBasePath('/'),
    siteName: 'design.system.design',
    title: 'Design system. System design.',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: withBasePath('/images/og.png'),
        width: 1200,
        height: 630,
        alt: 'Design system. System design. — design.system.design',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design system. System design.',
    description: SITE_DESCRIPTION,
    images: [withBasePath('/images/og.png')],
  },
};

export const viewport: Viewport = {
  themeColor: '#f2f4f1',
  colorScheme: 'light dark',
};

const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Script id='theme-init' strategy='beforeInteractive'>
          {THEME_INIT}
        </Script>
        <MotionConfig reducedMotion='user'>
          <Init />
          <Navbar />
          <a
            href='#content'
            className='bg-ink text-paper sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold'>
            Skip to content
          </a>
          <main id='content' className='mx-auto max-w-6xl px-5 pt-28 pb-24'>
            {children}
          </main>
          <footer className='border-ink/15 text-mute mx-auto max-w-6xl border-t px-5 py-8 text-sm'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <p>&copy; {new Date().getFullYear()} design.system.design.</p>
              <ThemeToggle />
            </div>
          </footer>
        </MotionConfig>
      </body>
    </html>
  );
};

export default RootLayout;
