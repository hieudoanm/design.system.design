# Architecture

- Technical reference for working in this repository.
- The README explains what the site is.
- This file explains how it is built and how to change it safely.

## What this is

- A static Next.js site with two independent subjects that share a word:
  - **Design System** — how to build a design system (atomic design, tokens, typography, charts, accessibility, responsive design).
  - **System Design** — system design interview problems.
- `src/components/organisms/Navbar.tsx` owns all navigation state.
- The landing page and the Q&A list animate with `motion/react`.
- Everything else is a static server component.

## Stack

| No  | Concern   | Choice                                                            |
| --- | --------- | ----------------------------------------------------------------- |
| 01  | Framework | `Next.js` 16.4.2, App Router, every route prerendered             |
| 02  | UI        | `React` 19, `TypeScript` 6, `TailwindCSS` 4 (`@theme` tokens)     |
| 03  | Fonts     | `@fontsource-variable/bricolage-grotesque`, `.../jetbrains-mono`  |
| 04  | Animation | `motion` 14 (`motion/react`) for the landing page, navbar and Q&A |
| 05  | State     | None beyond the navbar's toggle and mount animations              |
| 06  | Data      | `TypeScript` modules under `src/content`                          |
| 07  | Tests     | `Vitest` 5, `Testing Library`, `jsdom`, v8 coverage               |
| 08  | Browser   | `Playwright` 1.64, Chromium, video recording                      |
| 09  | Diagrams  | `mermaid` 12 for client-rendered charts                           |
| 10  | Code      | `shiki` for syntax highlighting                                   |

- `next.config.ts` sets `reactStrictMode` and `output: 'export'`.
- It reads `basePath` from `site.config.json`.
- The build writes a plain static site to `out/`.
- The site is served from `hieudoanm.github.io/design.system.design`.
- `next start` does not work with an export.
- `pnpm start` serves `out/` with `scripts/ts/serve.mts`, under the same base path.
- Every page is prerendered either way.
- There is no backend, no database and no client data fetching.
- Do not add any without a very good reason.

## Layout

```
src/
  app/
    layout.tsx            root metadata, fonts, navbar, footer
    page.tsx              landing page (client — it animates on mount)
    loading.tsx           route-level loading state
    not-found.tsx         404
    error.tsx             route-level error boundary (client)
    global-error.tsx      root error boundary (client)
    globals.css           @theme tokens, graph paper, glass, toggle pill
    design-system/
      page.tsx            chapter index: one card per topic
      [slug]/page.tsx     one page per topic, statically generated
    system-design/
      page.tsx            problem index
      [slug]/page.tsx     one page per problem, statically generated
  components/
    atoms/
      Code.tsx            labelled code block
      Figure.tsx          one drawing: a title, inline SVG and a data table
      Rich.tsx            mini markdown renderer (`code`, **bold**, links, paragraphs)
      ThemeToggle.tsx     light/dark switch in the footer (client)
    molecules/
      AnimatedCard.tsx     animated link card for the landing page (client)
      Figures.tsx          the figures of one section, in a grid
      Qa.tsx              native <details> question list (client, animated)
      Section.tsx         section with an anchor id
    organisms/
      Navbar.tsx          the site header and its three-way toggle (client)
    templates/
      TopicTemplate.tsx   shared page template (both subjects) — data-driven blocks
      TopicsTemplate.tsx  shared index template (both subjects)
    __tests__/            one test file per component under each folder
  content/
    ts/types.ts           shared block and template types
    ts/design-system/     one folder per group (6 groups × 4 topics), plus index.ts
    ts/system-design/     one folder per group (6 groups × 4 problems), plus index.ts and types.ts
  lib/
    paths.ts              the base path and withBasePath() for raw <a> hrefs
    theme.ts              light/dark theme read, apply and system fallback
    __tests__/            one test file per module
scripts/
  sh/
    svg-to-png.sh         regenerates the PNG icons from icon.svg
  ts/
    generate-svg.mts      turns every topic's svg/*.svg into svg-generated.ts
    serve.mts             static file server for the exported site in out/
    generate-assets.mts     turns the Playwright WebM recording into assets/
assets/
  navigation.mp4          the navbar walk, as H.264
  navigation.gif          the same walk, as an animated GIF
site.config.json          origin and basePath of the published site
vitest.config.mts        the test runner: jsdom, the @/ alias, coverage rules
vitest.setup.ts          jsdom polyfills and the Testing Library cleanup
playwright.config.ts     the browser runner: the exported site, video on
e2e/
  navigation.spec.ts      the landing page, then both chapters, from the navbar
public/
  icons/                  favicon, PWA icons, the SVG mark
  images/                 og.png and og.svg (the social card)
  manifest.json  robots.txt  sitemap.xml  humans.txt
```

- `src/components` is split by atomic design level.
- A component sits in the lowest folder that describes it.
- `atoms` are self-contained leaf renderers.
- `molecules` compose a few atoms into one job.
- `organisms` are recognisable interface regions.
- `templates/` holds shared layout structures (reusable, no route, no metadata).
  - `TopicTemplate.tsx` renders a single topic page (both design-system and system-design use it).
  - `TopicsTemplate.tsx` renders grouped index pages (used by `/design-system` and `/system-design`).
- Both slug routes are route pages (`NextPage` + `metadata`) that normalize their content and pass it to templates.

## Routes

- Every route is statically generated.
- Dynamic routes use `generateStaticParams`.
- They must call `notFound()` for an unknown slug.

| No  | Route                   | Source of truth                                            |
| --- | ----------------------- | ---------------------------------------------------------- |
| 01  | `/`                     | `src/app/page.tsx`                                         |
| 02  | `/design-system`        | `topics` — the chapter index, one card per topic           |
| 03  | `/design-system/[slug]` | `topics` — one page per topic, the id is the slug          |
| 04  | `/system-design`        | `src/content/ts/system-design/index.ts` — `problemGroups`  |
| 05  | `/system-design/[slug]` | `problems` — one page per problem, the id is the file name |

- To add a topic or a problem:
  - Add it to the array in the matching `index.ts`.
  - Add the route to `public/sitemap.xml`.
  - The page appears with no other change.
- The atomic design levels (tokens, atoms, molecules, organisms, templates, pages) are sections of the `atomic-design` topic.
- They are not routes of their own.

## Templates

- `TopicTemplate` renders one topic page.
- Both `[slug]` routes normalize their content into `TopicPageData` and render it.
- The page owns metadata, prev/next and the category label.
- The template owns the header, sidebar TOC, sections, footer and block rendering.
- `TopicSectionData` requires `blocks`; the template never knows which subject it is rendering.
- `theme` switches accent colours: `system-design` is cobalt, `design-system` is marker.
- `TopicsTemplate` renders a grouped index page for `/design-system` and `/system-design`.
- Keep both templates server components.
- The only client parts are the navbar, the landing page, `ThemeToggle`, `Qa` and `AnimatedCard`.
