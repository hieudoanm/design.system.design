import type { NextConfig } from 'next';
import site from './site.config.json';

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
  basePath: site.basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: site.basePath,
    NEXT_PUBLIC_SITE_ORIGIN: site.origin,
  },
};

export default nextConfig;
