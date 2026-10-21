/**
 * Serves the static export in `out/` — the site is a folder of files, so a
 * plain file server is all it needs.
 *
 *   pnpm build && pnpm start        # http://localhost:3000/design.system.design
 *
 * The export is mounted under the same base path GitHub Pages uses, so the
 * local preview matches production. Clean URLs are supported too:
 * /design.system.design/design-system/components serves
 * out/design-system/components.html.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import site from '../site.config.json' with { type: 'json' };

const ROOT = resolve(process.cwd(), 'out');
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 3000);
const basePath = site.basePath;

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

/** Resolve a URL path to a file inside `out/`, or null. */
const resolveFile = (urlPath) => {
  const pathname = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const relative = normalize(pathname).replace(/^([/\\])+/, '');
  const candidates = [join(ROOT, relative)];

  if (!extname(relative)) {
    candidates.push(join(ROOT, `${relative}.html`));
    candidates.push(join(ROOT, relative, 'index.html'));
  }

  for (const candidate of candidates) {
    if (!candidate.startsWith(ROOT + sep)) continue;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }

  return null;
};

if (!existsSync(ROOT)) {
  console.error('out/ not found — run `pnpm build` first.');
  process.exit(1);
}

createServer((req, res) => {
  const url = req.url ?? '/';
  const pathname = decodeURIComponent(url.split('?')[0].split('#')[0]);

  // The site is mounted under the base path, exactly like GitHub Pages.
  if (basePath && !pathname.startsWith(basePath)) {
    if (pathname === '/') {
      res.writeHead(302, { location: `${basePath}/` });
      res.end();
      return;
    }

    res.writeHead(404, { 'content-type': CONTENT_TYPES['.html'] });

    if (existsSync(join(ROOT, '404.html'))) {
      createReadStream(join(ROOT, '404.html')).pipe(res);
    } else {
      res.end('Not found');
    }

    return;
  }

  const file = resolveFile(pathname.slice(basePath.length) || '/');

  if (!file) {
    const notFound = join(ROOT, '404.html');
    res.writeHead(404, { 'content-type': CONTENT_TYPES['.html'] });

    if (existsSync(notFound)) {
      createReadStream(notFound).pipe(res);
    } else {
      res.end('Not found');
    }

    return;
  }

  res.writeHead(200, {
    'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Serving ${ROOT} on http://localhost:${PORT}${basePath}/`);
});
