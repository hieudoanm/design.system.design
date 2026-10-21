# AGENTS.md

- Technical reference for working in this repository.
- The README explains what the site is.
- This file is the index; each area has its own file under `docs/agents/`.
- Every file is kept under ~200 lines.

## Read this first

- A static Next.js site with two independent subjects that share a word:
  - **Design System** — how to build a design system.
  - **System Design** — system design interview problems.
- Every route is prerendered into `out/`.
- There is no backend, no database and no client data fetching.
- `src/components/organisms/Navbar.tsx` owns all navigation state.
- Everything is a static server component except the navbar, landing page, `Qa`, `AnimatedCard` and `ThemeToggle`.
- `pnpm build` and `pnpm test` must pass before a change is done.

## Guides

| No  | File                                                | Covers                                                       |
| --- | --------------------------------------------------- | ------------------------------------------------------------ |
| 01  | [architecture.md](./docs/agents/01-architecture.md) | What the site is, stack, layout, routes, templates           |
| 02  | [content.md](./docs/agents/02-content.md)           | Content model, blocks, figures, adding chapters and problems |
| 03  | [components.md](./docs/agents/03-components.md)     | Atomic split, key components, conventions                    |
| 04  | [styling.md](./docs/agents/04-styling.md)           | Design tokens, dark mode, graph paper, assets                |
| 05  | [testing.md](./docs/agents/05-testing.md)           | Vitest, Playwright, coverage, test patterns                  |
| 06  | [workflows.md](./docs/agents/06-workflows.md)       | Local dev, checks, scripts, adding content                   |
| 07  | [deployment.md](./docs/agents/07-deployment.md)     | GitHub Pages, base path, custom domains                      |
| 08  | [gotchas.md](./docs/agents/08-gotchas.md)           | Traps: params, exports, base path, scripts, coverage         |

## Quick commands

```bash
pnpm dev         # http://localhost:3000/design.system.design
pnpm typecheck   # tsc --noEmit
pnpm lint:check  # eslint, no fix
pnpm test        # vitest, one run
pnpm e2e         # playwright, against the exported site
pnpm build       # lint + format check, then next build -> out/
pnpm start       # serve out/
```

## Non-negotiables

- **Bullet points, not paragraphs.** Every rule is a bullet, and every sentence is short.
- **Server components by default.** A new client component needs a reason.
- **Components are `FC`, pages are `NextPage`.**
- **Content stays in `src/content`.** Components never import from each other to reach data.
- **Tailwind utilities, not CSS files.** Only tokens and the two shared classes live in `globals.css`.
- **Colour comes from a token.** Never hard-code a hex value in a component.
- **Do not reformat files wholesale as part of an unrelated change.**
- **Keep diffs to what you touched.**
