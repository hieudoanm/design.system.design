# AGENTS.md

- Technical reference for working in this repository.
- The README explains what the site is.
- This file explains how it is built and how to change it safely.

## What this is

- A static Next.js site with two independent subjects that share a word:
  - **Design System** — how to build a design system (atomic design, tokens,
    typography, charts, accessibility, responsive design).
  - **System Design** — system design interview problems.
- `src/components/organisms/Navbar.tsx` owns all navigation state.
- The landing page and the Q&A list animate with `motion/react`.
- Everything else is a static server component.

## Stack

| Concern   | Choice                                                            |
| --------- | ----------------------------------------------------------------- |
| Framework | Next.js 16.4.2, App Router, every route prerendered               |
| UI        | React 19, TypeScript 6, Tailwind CSS 4 (`@theme` tokens)          |
| Fonts     | `@fontsource-variable/bricolage-grotesque`, `.../jetbrains-mono`  |
| Animation | `motion` 14 (`motion/react`) for the landing page, navbar and Q&A |
| State     | None beyond the navbar's toggle and mount animations              |
| Data      | TypeScript modules under `src/content`                            |
| Tests     | Vitest 5, Testing Library, jsdom, v8 coverage                     |
| Browser   | Playwright 1.64, Chromium, video recording                        |
| Scripts   | Node 26 running `.mts` directly, no build step                    |

- `next.config.ts` sets `reactStrictMode` and `output: 'export'`.
- It reads `basePath` from `site.config.json`.
- The build writes a plain static site to `out/`.
- The site is served from `hieudoanm.github.io/design.system.design`.
- `next start` does not work with an export.
- `pnpm start` serves `out/` with `scripts/ts/serve.mts`, under the same base
  path.
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
      __tests__/          one test file per component
    molecules/
      AnimatedCard.tsx     animated link card for the landing page (client)
      Figures.tsx          the figures of one section, in a grid
      Qa.tsx              native <details> question list (client, animated)
      Section.tsx         section with an anchor id
      __tests__/          one test file per component
    organisms/
      Navbar.tsx          the site header and its three-way toggle (client)
      __tests__/          one test file per component
  content/
    ts/design-system/     one file or folder per topic, plus index.ts (the barrel)
    ts/system-design/     one file per problem, plus index.ts and types.ts
  lib/
    paths.ts              the base path and withBasePath() for raw <a> hrefs
    __tests__/            one test file per module
scripts/
  sh/
    svg-to-png.sh         regenerates the PNG icons from icon.svg
  ts/
    generate-svg.mts      turns every topic's svg/*.svg into svg-generated.ts
    serve.mts             static file server for the exported site in out/
    videos-to-mp4.mts     turns the Playwright WebM recording into assets/
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
- There is no `templates/` folder.
- Nothing in the site is a page-level layout component.

## Routes

- Every route is statically generated.
- Dynamic routes use `generateStaticParams`.
- They must call `notFound()` for an unknown slug.

| Route                   | Source of truth                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `/`                     | `src/app/page.tsx`                                                                                        |
| `/design-system`        | `topics` — the chapter index, one card per topic                                                          |
| `/design-system/[slug]` | `topics` — ids `components`, `design-tokens`, `fonts`, `charts`, `accessibility`, `responsive`            |
| `/system-design`        | `src/content/ts/system-design/index.ts`                                                                   |
| `/system-design/[slug]` | `problems` — ids `url-shortener`, `rate-limiter`, `unique-id-generator`, `key-value-store`, `chat-system` |

- To add a topic or a problem:
  - Add it to the array in the matching `index.ts`.
  - Add the route to `public/sitemap.xml`.
  - The page appears with no other change.
- The atomic design levels (tokens, atoms, molecules, organisms, templates,
  pages) are sections of the `components` topic.
- They are not routes of their own.

## Content model

- Content is plain TypeScript, not markdown files.
- Two shapes:

```ts
type Topic = {
  slug: string;
  title: string;
  tagline: string; // one line, used on the index card
  summary: string; // long-form intro
  sections: TopicSection[];
};

type TopicSection = {
  id: string; // anchor id, also the TOC key
  title: string;
  intro?: string; // one line under the heading
  body?: string; // long form, supports `code`, **bold**, [links], paragraphs
  items?: { title: string; body: string }[]; // definition-style pairs
  examples?: string[]; // bullet list
  rules?: string[]; // bullet list
  code?: { label: string; source: string };
  visuals?: TopicVisual[]; // drawings, rendered under the prose
};

type TopicVisual = {
  title: string;
  caption?: string;
  svg?: string; // markup from the topic's svg/ folder, via svg-generated.ts
  table?: TopicTable; // the data behind the drawing
  full?: boolean; // span the whole width instead of one column
  minWidth?: number; // below it the figure scrolls sideways
  maxWidth?: number; // the drawing is centred inside it
};

type TopicTable = {
  columns: string[];
  rows: string[][];
  summary?: string; // when set, the table is collapsed behind this label
};

type Problem = {
  slug: string;
  title: string;
  tagline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  requirements: Block[];
  estimate: Block[];
  architecture: string; // ASCII diagram
  decisions: Block[];
  qa: { q: string; a: string }[];
};
```

- `src/content/ts/design-system/` holds one file or folder per topic, plus
  `index.ts`:

| Topic               | Shape                | Exports                                                                     |
| ------------------- | -------------------- | --------------------------------------------------------------------------- |
| `components`        | `components.ts`      | `components` plus `atomicLevels`, `principles`, `practice`, `repoStructure` |
| `design-tokens`     | `design-tokens.ts`   | `designTokens`                                                              |
| `accessibility`     | `accessibility.ts`   | `accessibility`                                                             |
| `fonts`             | `fonts/`             | `fonts`                                                                     |
| `charts`            | `charts/`            | `charts`                                                                    |
| `responsive`        | `responsive/`        | `responsive`                                                                |
| `icons`             | `icons/`             | `icons`                                                                     |
| `animation`         | `animation/`         | `animation`                                                                 |
| `scientific-charts` | `scientific-charts/` | `scientificCharts`                                                          |
| `index.ts`          | —                    | the `Topic` types, the `topics` array and `getTopic()`                      |

- A topic with drawings is a folder:
  - `index.ts` holds the prose, the data arrays and the tables.
  - `svg/*.svg` holds one file per drawing.
  - `svg-generated.ts` is generated from `svg/` and must not be edited.
- A topic without drawings stays a single `.ts` file.
- `index.ts` is the only place the list is assembled.
- Topic files import their type with `import type { Topic } from '../index'`.
- The import is erased at compile time, so there is no runtime cycle.
- `Rich.tsx` renders the tiny markdown subset: `` `code` ``, `**bold**`,
  `[label](href)` and paragraphs separated by a blank line.
- It is deliberately not a full markdown parser.
- `Code.tsx` renders fenced code.
- `Qa.tsx` renders `<details>` lists.

### Figures

- `visuals` are the drawings.
- `Figure.tsx` renders one as a `<figure>`: a caption, the inline SVG and — when
  the visual carries data — the table of that data.
- `Figures.tsx` lays a section's figures out in two columns on a wide screen.
- `full: true` spans both columns.
- The SVG is a file under the topic's `svg/` folder, and it is trusted content.
- It is injected with `dangerouslySetInnerHTML`.
- `scripts/ts/generate-svg.mts` turns every `svg/*.svg` into the matching
  `svg-generated.ts`, which `index.ts` imports.
- Run it after adding or editing a drawing: `node scripts/ts/generate-svg.mts`.
- Pass a topic to regenerate one: `node scripts/ts/generate-svg.mts charts`.
- Five rules keep it honest:
  - **Colour comes from a token.** `style='fill:var(--color-chart-1)'`, never a
    hex value. `var()` resolves inside a `style` attribute only, never in an SVG
    presentation attribute.
  - **Every drawing has a `<title>`** with an `id`, pointed at by `role='img'`
    and `aria-labelledby`, so it is announced instead of ignored.
  - **Title ids are namespaced.** They share a page with the section anchor ids,
    so prefix them: `chart-`, `font-`, `screen-`, `animation-`, `scientific-`,
    `icon-`. A duplicate id breaks `aria-labelledby`.
  - **A drawing and its table show the same numbers.** The data array in
    `index.ts` builds the table; the `.svg` file draws the same values. Change
    one, change the other.
  - **The ink stays inside the viewBox.** Draw within it and check `getBBox()`
    in the browser. Text is the usual thing that runs past the edge.

## Design tokens

- All colour, type and spacing values come from the `@theme` block in
  `src/app/globals.css`.
- Never hard-code a hex value in a component.

| Token    | Value     | Meaning                     |
| -------- | --------- | --------------------------- |
| `paper`  | `#f2f4f1` | page background             |
| `ink`    | `#111827` | text, the mark's background |
| `mute`   | `#566070` | secondary text              |
| `rule`   | `#cfd6df` | borders and the major grid  |
| `marker` | `#c2255c` | Design System               |
| `cobalt` | `#1f4fd8` | System Design               |

- The chart palette is a separate block of six categorical colours.
- They are used in a fixed order, so a series keeps its colour across every
  drawing.

| Token     | Value     | Meaning                   |
| --------- | --------- | ------------------------- |
| `chart-1` | `#1f4fd8` | cobalt, the first series  |
| `chart-2` | `#c2255c` | marker, the second series |
| `chart-3` | `#0f766e` | teal, the third series    |
| `chart-4` | `#b45309` | amber, the fourth series  |
| `chart-5` | `#6d28d9` | violet, the fifth series  |
| `chart-6` | `#475569` | slate, the sixth series   |

- The background is a graph paper.
- It is a 24px minor grid at 3% ink and a 120px major grid at 7% ink.
- Both are declared as four `linear-gradient` backgrounds on `body`.

## Conventions

- **Bullet points, not paragraphs.** Every rule in this file is a bullet, and
  every sentence is short. Keep it that way when you edit this file.
- **Server components by default.** `Navbar.tsx`, `AnimatedCard.tsx`, `Qa.tsx`,
  `page.tsx`, `error.tsx` and `global-error.tsx` carry `'use client'` — they
  all animate with `motion/react`. A new client component needs a reason.
- **Components are `FC`, pages are `NextPage`.** A component in
  `src/components` is `const Name: FC<Props> = ...`; a route in `src/app` is
  `const Name: NextPage = ...`, or `NextPage<{ params: Promise<Params> }>` when
  it takes params. `error.tsx` and `global-error.tsx` keep `FC` because
  `NextPage` does not model their `error`/`reset` props.
- **Content stays in `src/content`.** Components never import from each other
  to reach data.
- **Tailwind utilities, not CSS files.** The only global CSS is `globals.css`,
  and only for tokens and the two shared classes (`.glass`, `.toggle-pill`).
- **The toggle is the brand.** The icon in `public/icons` and the social card
  are the same three-segment bar as the navbar highlight. Change one, change
  all three.

## Assets

- `public/icons` holds the mark at every size a platform asks for.
- It is `icon.svg` plus PNGs at 16, 32, 48, 64, 96, 128, 152, 167, 180, 192,
  256, 384 and 512.
- It also holds a multi-resolution `favicon.ico`.
- `public/images` holds `og.png` and `og.svg` — the same 1200×630 card.
- The SVG is the source.
- The card and the icon are generated from the tokens and the site's own
  typefaces, so they must match `globals.css`.
- If you change a colour or a typeface, regenerate them.
- The mark in the card's bottom-right corner is `public/icons/icon.svg` at
  1.5× — a 96×96 tile.
- The pill is 72×24, centred (12px margins), split 25.5/21/25.5.
- Do not redraw it: scale the icon's own geometry.
- Otherwise the pill drifts off-centre and the tile reads as a plain dark
  square.
- They are wired up in the `metadata` export of `src/app/layout.tsx`: `icons`,
  `openGraph`, `twitter`, `manifest`, `alternates.canonical` and a `viewport`
  export for `themeColor`.
- Removing a file from `public/` without updating `layout.tsx` leaves a
  dangling reference.

## Adding a design system chapter

1. Create `src/content/ts/design-system/<slug>.ts` exporting one `Topic`.
2. Add it to the `topics` array in `src/content/ts/design-system/index.ts`. The
   array order drives the index page and the previous/next links.
3. Add `/design-system/<slug>` to `public/sitemap.xml`.

- If the topic has drawings, make it a folder instead.
- Put the `Topic` in `<slug>/index.ts` with `import type { Topic } from '../index'`.
- Put each drawing in `<slug>/svg/<name>.svg`.
- Run `node scripts/ts/generate-svg.mts <slug>` to write `<slug>/svg-generated.ts`.
- Import the drawings from `./svg-generated` in `<slug>/index.ts`.
- The index page and the `[slug]` page both read `topics`.
- Both pick it up automatically.

## Adding a system design problem

1. Create `src/content/ts/system-design/<slug>.ts` exporting one `Problem`.
2. Add it to the `problems` array in `src/content/ts/system-design/index.ts`.
   The array order drives the index page and the "next problem" link.
3. Add `/system-design/<slug>` to `public/sitemap.xml`.

## Tests

- Two runners: Vitest for the unit tests, Playwright for the browser tests.

### Unit tests

- Vitest runs the unit tests.
- The config is `vitest.config.mts`.
- The setup file is `vitest.setup.ts`.

```bash
pnpm test           # one run
pnpm test:watch     # watch mode
pnpm test:coverage  # one run, then the coverage report and the thresholds
```

| Rule        | Detail                                                                       |
| ----------- | ---------------------------------------------------------------------------- |
| Location    | `__tests__/` next to the file under test, one test file per source           |
| Runner      | Vitest 5, jsdom, Testing Library for React                                   |
| Alias       | `@/` maps to `src/`, the same as `tsconfig.json`                             |
| Coverage    | v8 provider, 80% for statements, branches, functions and lines               |
| Not covered | `src/content` — it is data, not logic, and the pages that render it cover it |

- A test file is named after the file it covers.
- `Rich.tsx` is tested by `src/components/atoms/__tests__/Rich.test.tsx`.
- Three things need care:
  - **Mock `next/navigation`.** `usePathname()` needs a router, and
    `notFound()` has to throw so the test can assert on it:
    `vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }))`.
  - **Async server components are called, not rendered.** `await Page({ params })`
    returns the element tree, which is then handed to `render()`. The `NextPage`
    type is a union, so cast it to a plain function first.
  - **The root layout renders `<html>`.** Rendering it into a `<div>` trips
    React's DOM nesting check, so `layout.tsx` is tested with
    `renderToStaticMarkup` from `react-dom/server`.

### Browser tests

- Playwright drives a real Chromium against the exported site.
- `e2e/navigation.spec.ts` walks the whole site.
- It starts at the landing page, then the design system chapter, then the
  system design problems.
- Both chapters are opened from the navbar.
- The pill animation is checked at every step.

```bash
pnpm e2e         # build the site, serve it, run the browser test
pnpm e2e:video   # the same, then turn the recordings into MP4s
```

| Rule     | Detail                                                                                    |
| -------- | ----------------------------------------------------------------------------------------- |
| Location | `e2e/`, one spec per journey                                                              |
| Server   | the static export in `out/`, served with the same base path                               |
| Video    | every run is recorded, as WebM in `test-results/`                                         |
| Output   | `scripts/ts/videos-to-mp4.mts` writes `assets/navigation.mp4` and `assets/navigation.gif` |

- The converter runs after the tests.
- It reads the WebM out of `test-results/`.
- It uses the ffmpeg build from `ffmpeg-static`, because the one bundled with
  Playwright cannot encode H.264.
- Set `FFMPEG_BIN` to use a different binary.
- The spec reads the expected content from `src/content`.
- It checks that the pages render the content the data says they should.
- It stays valid when a chapter is renamed.
- Every `href` in the DOM carries the base path.
- So it is `/design.system.design/design-system`, not `/design-system`.

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
- It lints, checks formatting, type-checks and prerenders all routes into
  `out/`.
- It catches a broken import, a bad slug and an invalid `metadata` export.
- `pnpm test` must pass too.
- `pnpm test:coverage` must stay above the 80% threshold.
- Prettier is configured in `.prettierrc.json`.
- The codebase is formatted with it.
- Do not reformat files wholesale as part of an unrelated change.
- Keep diffs to what you touched.

## Deployment

- `.github/workflows/ci.yaml` is the only deploy path.
- A push to `master` runs the build job: install, `pnpm typecheck`,
  `pnpm test:coverage`, the Playwright browsers, `pnpm e2e` and `pnpm build`.
- The job uploads `out/` with `actions/upload-pages-artifact`.
- A second job publishes it with `actions/deploy-pages`.
- Pull requests run the build job and stop there.
- The repo is a GitHub Pages _project_ site.
- It is published at `https://hieudoanm.github.io/design.system.design`.
- That path is the Next.js `basePath`.
- It is read from `site.config.json` and injected as
  `NEXT_PUBLIC_BASE_PATH` / `NEXT_PUBLIC_SITE_ORIGIN` by `next.config.ts`.
- To move the site to a custom domain:
  - Point `origin` at the domain.
  - Blank `basePath` in `site.config.json`.
  - Update `public/sitemap.xml` and `public/robots.txt`.
- Nothing else needs to change: the base path is the only thing that differs
  between the two shapes.

## Things that will bite you

- **`params` is a promise.** In Next 15+ App Router, `params` in pages and
  `generateMetadata` is `Promise<...>`. `await` it.
- **`generateStaticParams` must cover every slug** or the route is not
  prerendered.
- **A stray `backend/` directory existed** at the repo root. It was a byte copy
  of another project's Python service. It was removed. Do not reintroduce
  Python into this repo.
- **The repo's history is thin.** It was published as a single `Initial
Commit`. There is little to recover from, so be careful with destructive
  commands.
- **`scripts/ts/*.mts` run on Node's type stripper**, not on a compiler. Only
  erasable syntax works: no `enum`, no `namespace`, no constructor parameter
  properties. Types, `as`, generics and `import type` are all fine. The
  scripts resolve paths against `process.cwd()`, so run them from the repo
  root.
- **`public/` is served at the root**, so `public/icons/icon.svg` is
  `/icons/icon.svg`. Paths in `metadata` must include the subdirectory.
- **The build writes `out/`, not `.next/`.** `output: 'export'` means
  `next start` refuses to run, so `pnpm start` serves `out/` with
  `scripts/ts/serve.mts`. A static host must map clean URLs to `.html`:
  `/design-system/components` is `out/design-system/components.html`.
- **The base path is not automatic outside `next/link`.** A `<Link href>` gets
  the `/design.system.design` prefix for free; a plain `<a href>` does not.
  Use `withBasePath()` from `src/lib/paths.ts` for those, and for the
  `metadata` URLs and the entries in `public/manifest.json`.
- **Next joins `metadataBase.pathname` with every metadata URL**, it does not
  replace it. `metadataBase` therefore stays on the origin and the paths carry
  the base path themselves — otherwise every URL comes out doubled.
- **`usePathname()` does not include the base path**, but `modeFor()` in
  `Navbar.tsx` strips it anyway so the toggle works either way.
- **`src/content` is out of the coverage report.** It is data, not logic, so it
  is excluded in `vitest.config.mts`. A new component is not: it has to come
  with a test in its own `__tests__/` folder, or the 80% threshold fails.
