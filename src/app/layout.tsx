import Navbar from '@/components/organisms/Navbar';
import ThemeToggle from '@/components/atoms/ThemeToggle';
import { withBasePath } from '@/lib/paths';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/jetbrains-mono';
import type { Metadata, Viewport } from 'next';
import type { FC } from 'react';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'http://localhost:3000';

export const metadata: Metadata = {
  // Next joins `metadataBase.pathname` with every relative metadata URL, so
  // the base stays on the origin and the paths carry the prefix themselves.
  metadataBase: new URL(siteOrigin),
  title: {
    default: 'design.system.design',
    template: '%s | design.system.design',
  },
  description:
    'Two subjects that share a word: how to build a design system with atomic design, and how to answer system design interview questions.',
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
    description:
      'Two subjects that share a word: how to build a design system with atomic design, and how to answer system design interview questions.',
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
    description:
      'Two subjects that share a word: how to build a design system with atomic design, and how to answer system design interview questions.',
    images: [withBasePath('/images/og.png')],
  },
};

export const viewport: Viewport = {
  themeColor: '#f2f4f1',
  colorScheme: 'light dark',
};

/**
 * Sets the theme before the page paints, so there is no flash of the wrong
 * background. It mirrors `src/lib/theme.ts`: the stored choice wins, the
 * system preference is the default.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var t=d?'dark':'light';document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',d?'#0e1116':'#f2f4f1');}catch(e){}})();`;

const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Navbar />
        <main className='mx-auto max-w-6xl px-5 pt-28 pb-24'>{children}</main>
        <footer className='border-ink/15 text-mute mx-auto max-w-6xl border-t px-5 py-8 text-sm'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <p>&copy; {new Date().getFullYear()} design.system.design.</p>
            <ThemeToggle />
          </div>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
