import type { NextConfig } from 'next';
import site from './site.config.json';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
      },
    },
  },

  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  // GitHub Pages project site lives under /design.system.design/
  basePath: site.basePath,
  assetPrefix: NODE_ENV === 'production' ? site.basePath : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: site.basePath,
    NEXT_PUBLIC_SITE_ORIGIN: site.origin,
  },
  images: { unoptimized: true },
};

export default nextConfig;
