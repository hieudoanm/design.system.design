# Workflows

## Local development

```bash
pnpm install
pnpm dev
```

- The dev server runs at <http://localhost:3000/design.system.design>.

## Checks

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint:check  # eslint, no fix
pnpm test        # vitest, one run
pnpm e2e         # playwright, against the exported site
pnpm build       # lint + format check, then next build -> out/
pnpm start       # serve out/ on http://localhost:3000/design.system.design
pnpm dev         # http://localhost:3000/design.system.design
```

- `pnpm build` must pass before any change is considered done.
- It lints, checks formatting, type-checks and prerenders all routes into `out/`.
- It catches a broken import, a bad slug and an invalid `metadata` export.
- `pnpm test` must pass too.
- `pnpm test:coverage` must stay above the 80% threshold.
- Prettier is configured in `.prettierrc.json`.
- The codebase is formatted with it.
- Do not reformat files wholesale as part of an unrelated change.
- Keep diffs to what you touched.

## Scripts

- `scripts/ts/*.mts` run on Node's type stripper, not on a compiler.
- Only erasable syntax works: no `enum`, no `namespace`, no constructor parameter properties.
- Types, `as`, generics and `import type` are all fine.
- The scripts resolve paths against `process.cwd()`, so run them from the repo root.

| Script                | Job                                                      |
| --------------------- | -------------------------------------------------------- |
| `generate-svg.mts`    | Turns every topic's `svg/*.svg` into `svg-generated.ts`. |
| `serve.mts`           | Static file server for `out/`.                           |
| `generate-assets.mts` | Turns the Playwright WebM recording into `assets/`.      |

- Regenerate one topic's drawings: `node scripts/ts/generate-svg.mts <slug>`.

## Adding content

- A design system chapter: see [content.md](./02-content.md#adding-a-design-system-chapter).
- A system design problem: see [content.md](./02-content.md#adding-a-system-design-problem).
- A new component needs a test in its own `__tests__/` folder, or the coverage threshold fails.
- Templates are covered through the route tests.
