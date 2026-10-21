import fs from 'node:fs';
import path from 'node:path';

type Router = 'app' | 'pages';

type SitemapConfig = {
  siteUrl: string;
  output: string;
  exclude: string[];
  additionalPaths: string[];
  resolveDynamicRoutes?: () => Promise<string[]>;
};

const ORIGIN = process.env.ORIGIN ?? 'https://hieudoanm.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/design.system.design';

const config: SitemapConfig = {
  siteUrl: `${ORIGIN.replace(/\/$/, '')}/${BASE_PATH.replace(/^\/|\/$/g, '')}`,
  output: 'public/sitemap.xml',
  exclude: ['/admin', '/dashboard'],
  additionalPaths: [],

  // Add real dynamic URLs here, if needed.
  // Example: fetch slugs from an API or CMS.
  resolveDynamicRoutes: async () => {
    return [];
  },
};

const PAGE_EXT = /\.(js|jsx|ts|tsx|mdx)$/;
const APP_PAGE_EXT = /^page\.(js|jsx|ts|tsx|mdx)$/;

const walk = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry): string[] => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('_') || entry.name === 'node_modules') {
        return [];
      }

      return walk(full);
    }

    return [full];
  });
};

const getRoute = (file: string, root: string, router: Router): string | null => {
  const relative = path.relative(root, file);
  const parts = relative.split(path.sep);
  const filename = parts.pop() ?? '';

  let segments: string[];

  if (router === 'app') {
    if (!APP_PAGE_EXT.test(filename)) return null;

    // Remove route groups, e.g. (marketing)
    segments = parts.filter((part) => !/^\(.*\)$/.test(part));
  } else {
    if (!PAGE_EXT.test(filename)) return null;

    const name = filename.replace(PAGE_EXT, '');

    if (name.startsWith('_') || name === '404' || name === '500' || parts.includes('api')) {
      return null;
    }

    segments = [...parts, name];

    // Remove only the trailing "index" segment
    if (segments.at(-1) === 'index') {
      segments.pop();
    }
  }

  // Exclude dynamic routes until their actual slugs are resolved.
  if (
    segments.some(
      (part) =>
        part.startsWith('[') ||
        part.startsWith('@') ||
        part.startsWith('_') ||
        part.startsWith('(.)') ||
        part.startsWith('(..)'),
    )
  ) {
    return null;
  }

  return `/${segments.join('/')}`;
};

const isExcluded = (route: string): boolean => {
  return config.exclude.some((pattern) => route === pattern || route.startsWith(`${pattern}/`));
};

const normalizeRoute = (route: string): string => {
  const pathname = route.startsWith('/') ? route : `/${route}`;

  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
};

const discoverRoutes = (): string[] => {
  const roots: Array<[string, Router]> = [
    ['app', 'app'],
    ['src/app', 'app'],
    ['pages', 'pages'],
    ['src/pages', 'pages'],
  ];

  const routes = new Set<string>();

  roots.forEach(([root, router]) => {
    walk(root).forEach((file) => {
      const route = getRoute(file, root, router);

      if (!route || isExcluded(route)) return;

      routes.add(normalizeRoute(route));
    });
  });

  return [...routes];
};

const resolveRoutes = async (): Promise<string[]> => {
  const staticRoutes = discoverRoutes();

  const dynamicRoutes = (await config.resolveDynamicRoutes?.()) ?? [];

  const allRoutes = [...staticRoutes, ...config.additionalPaths, ...dynamicRoutes];

  return [
    ...new Set(
      allRoutes
        .map(normalizeRoute)
        .filter((route) => !isExcluded(route))
        .filter((route) => !route.includes('[') && !route.includes(']')),
    ),
  ].sort();
};

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const generateSitemap = (routes: string[]): string => {
  const siteUrl = config.siteUrl.replace(/\/$/, '');

  const entries = routes
    .map((route) => {
      // Preserve BASE_PATH for GitHub Pages
      const relativePath = route.replace(/^\/+/, '');

      const loc = relativePath ? `${siteUrl}/${relativePath}` : `${siteUrl}/`;

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
};

const writeSitemap = (output: string, xml: string): void => {
  fs.mkdirSync(path.dirname(output), {
    recursive: true,
  });

  fs.writeFileSync(output, xml, 'utf8');
};

const main = async (): Promise<void> => {
  const routes = await resolveRoutes();
  const xml = generateSitemap(routes);

  writeSitemap(config.output, xml);

  console.log(`✓ Generated ${config.output} (${routes.length} URLs)`);
};

main().catch((error: unknown) => {
  console.error('Failed to generate sitemap:', error);
  process.exitCode = 1;
});
