# Contributing to design.system.design

Thanks for contributing to `design.system.design`, a static Next.js site that
pairs a design-system guide with system-design interview problems.

## Setup

```bash
git clone https://github.com/hieudoanm/design.system.design.git
cd design.system.design
pnpm install
```

Requires Node.js 26 (see `.node-version` / `.nvmrc`) and pnpm 12.

## Checks

Run before opening a pull request:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint (no fix; use lint:fix locally if needed)
pnpm test        # Vitest
pnpm e2e         # Playwright, against the exported site
pnpm build       # lint + format check, then prerender all routes into out/
```

`pnpm build` and `pnpm test` must pass before a change is considered done.

## Adding content

- Content lives in TypeScript modules under `packages/web/src/content/` — a new
  chapter or problem is one module, one array entry, and one sitemap line.
- A chapter with drawings is a folder: `index.ts` for prose, `svg/*.svg` for
  drawings, `svg-generated.ts` generated via `node scripts/ts/generate-svg.mts`.
- Keep prose in bullet points where the surrounding content does.

## Conventions

- Server components by default; a new client component needs a reason.
- Components are `FC`, pages are `NextPage`.
- Colour comes from a token in `globals.css` — never hard-code hex values.
- Do not reformat files wholesale as part of an unrelated change.

See [AGENTS.md](AGENTS.md) for the full technical reference.

## License

By contributing, you agree that your contributions will be licensed under the
repository license in [`LICENSE`](LICENSE).
