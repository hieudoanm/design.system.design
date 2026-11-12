/**
 * The site is published as a GitHub Pages project page, so it is served from
 * `hieudoanm.github.io/design.system.design` and every root relative path
 * needs that prefix.
 *
 * `next/link` adds the base path on its own. A plain `<a>` does not, so those
 * go through `withBasePath`.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefix a root relative path with the base path. */
export const withBasePath = (path: string): string =>
  path.startsWith('/') && !path.startsWith('//') ? `${basePath}${path}` : path;
