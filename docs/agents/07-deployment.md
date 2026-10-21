# Deployment

- `.github/workflows/ci.yaml` is the only deploy path.
- A push to `master` runs the build job: install, `pnpm typecheck`, `pnpm test:coverage`, the Playwright browsers, `pnpm e2e` and `pnpm build`.
- The job uploads `out/` with `actions/upload-pages-artifact`.
- A second job publishes it with `actions/deploy-pages`.
- Pull requests run the build job and stop there.
- The repo is a GitHub Pages _project_ site.
- It is published at `https://hieudoanm.github.io/design.system.design`.
- That path is the Next.js `basePath`.
- It is read from `site.config.json` and injected as `NEXT_PUBLIC_BASE_PATH` / `NEXT_PUBLIC_SITE_ORIGIN` by `next.config.ts`.
- To move the site to a custom domain:
  - Point `origin` at the domain.
  - Blank `basePath` in `site.config.json`.
  - Update `public/sitemap.xml` and `public/robots.txt`.
- Nothing else needs to change: the base path is the only thing that differs between the two shapes.
