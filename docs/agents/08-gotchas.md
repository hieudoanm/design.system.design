# Gotchas

- **`params` is a promise.** In Next 15+ App Router, `params` in pages and `generateMetadata` is `Promise<...>`. `await` it.
- **`generateStaticParams` must cover every slug** or the route is not prerendered.
- **The repo's history is thin.** It was published as a single `Initial Commit`. There is little to recover from, so be careful with destructive commands.
- **`scripts/ts/*.mts` run on Node's type stripper**, not on a compiler. Only erasable syntax works: no `enum`, no `namespace`, no constructor parameter properties. Types, `as`, generics and `import type` are all fine. The scripts resolve paths against `process.cwd()`, so run them from the repo root.
- **`public/` is served at the root**, so `public/icons/icon.svg` is `/icons/icon.svg`. Paths in `metadata` must include the subdirectory.
- **The build writes `out/`, not `.next/`.** `output: 'export'` means `next start` refuses to run, so `pnpm start` serves `out/` with `scripts/ts/serve.mts`. A static host must map clean URLs to `.html`: `/design-system/components` is `out/design-system/components.html`.
- **The base path is not automatic outside `next/link`.** A `<Link href>` gets the `/design.system.design` prefix for free; a plain `<a href>` does not. Use `withBasePath()` from `src/lib/paths.ts` for those, and for the `metadata` URLs and the entries in `public/manifest.json`.
- **Next joins `metadataBase.pathname` with every metadata URL**, it does not replace it. `metadataBase` therefore stays on the origin and the paths carry the base path themselves — otherwise every URL comes out doubled.
- **`usePathname()` does not include the base path**, but `modeFor()` in `Navbar.tsx` strips it anyway so the toggle works either way.
- **`src/content` is out of the coverage report.** It is data, not logic, so it is excluded in `vitest.config.mts`. A new component is not: it has to come with a test in its own `__tests__/` folder, or the 80% threshold fails.
