# Testing

- Two runners: Vitest for the unit tests, Playwright for the browser tests.

## Unit tests

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
  - **Mock `next/navigation`.** `usePathname()` needs a router, and `notFound()` has to throw so the test can assert on it: `vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }))`.
  - **Async server components are called, not rendered.** `await Page({ params })` returns the element tree, which is then handed to `render()`. The `NextPage` type is a union, so cast it to a plain function first.
  - **The root layout renders `<html>`.** Rendering it into a `<div>` trips React's DOM nesting check, so `layout.tsx` is tested with `renderToStaticMarkup` from `react-dom/server`.

## Browser tests

- Playwright drives a real Chromium against the exported site.
- `e2e/navigation.spec.ts` walks the whole site.
- It starts at the landing page, then the design system chapter, then the system design problems.
- Both chapters are opened from the navbar.
- The pill animation is checked at every step.

```bash
pnpm e2e         # build the site, serve it, run the browser test
pnpm e2e:video   # the same, then turn the recordings into MP4s
```

| Rule     | Detail                                                                                      |
| -------- | ------------------------------------------------------------------------------------------- |
| Location | `e2e/`, one spec per journey                                                                |
| Server   | the static export in `out/`, served with the same base path                                 |
| Video    | every run is recorded, as WebM in `test-results/`                                           |
| Output   | `scripts/ts/generate-assets.mts` writes `assets/navigation.mp4` and `assets/navigation.gif` |

- The converter runs after the tests.
- It reads the WebM out of `test-results/`.
- It uses the ffmpeg build from `ffmpeg-static`, because the one bundled with Playwright cannot encode H.264.
- Set `FFMPEG_BIN` to use a different binary.
- The spec reads the expected content from `src/content`.
- It checks that the pages render the content the data says they should.
- It stays valid when a chapter is renamed.
- Every `href` in the DOM carries the base path.
- So it is `/design.system.design/design-system`, not `/design-system`.
