import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = process.env.ORIGIN ?? 'https://hieudoanm.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/design.system.design';
const OUT_DIR = 'out';
const OUTPUT = path.join(OUT_DIR, 'sitemap.xml');

const siteUrl = `${ORIGIN.replace(/\/$/, '')}/${BASE_PATH.replace(/^\/|\/$/g, '')}`;

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

/**
 * The export writes one .html file per page (`foo.html`, or `foo/index.html`
 * for the index of a section). Both map to the same route, so a Set dedupes.
 */
const routeFor = (file: string): string | null => {
  const relative = path.relative(OUT_DIR, file).split(path.sep).join('/');
  const name = relative.replace(/\.html$/, '');

  if (name.startsWith('_') || name === '404' || name === '404/index') return null;

  const route = name === 'index' ? '/' : `/${name.replace(/\/index$/, '')}`;

  return route === '/' ? route : route.replace(/\/+$/, '');
};

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const main = (): void => {
  const routes = [
    ...new Set(
      walk(OUT_DIR)
        .filter((file) => file.endsWith('.html'))
        .map(routeFor)
        .filter((route): route is string => route !== null),
    ),
  ].sort();

  const entries = routes
    .map((route) => {
      const relativePath = route.replace(/^\/+/, '');
      const loc = relativePath ? `${siteUrl}/${relativePath}` : `${siteUrl}/`;

      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  fs.writeFileSync(OUTPUT, xml, 'utf8');

  console.log(`✓ Generated ${OUTPUT} (${routes.length} URLs)`);
};

try {
  main();
} catch (error: unknown) {
  console.error('Failed to generate sitemap:', error);
  process.exitCode = 1;
}
