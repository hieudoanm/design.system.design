# Components

## Split

- `src/components` is split by atomic design level.
- A component sits in the lowest folder that describes it.
- `atoms` are self-contained leaf renderers.
- `molecules` compose a few atoms into one job.
- `organisms` are recognisable interface regions.
- `templates/` holds shared layout structures (reusable, no route, no metadata).

## Key components

| Level     | Component            | Purpose                                                                   |
| --------- | -------------------- | ------------------------------------------------------------------------- |
| atoms     | `Code.tsx`           | Labelled code block (Shiki).                                              |
| atoms     | `Figure.tsx`         | One drawing: title, inline SVG, optional data table.                      |
| atoms     | `Rich.tsx`           | Mini markdown renderer (`code`, `**bold**`, `[label](href)`, paragraphs). |
| atoms     | `ThemeToggle.tsx`    | Light/dark switch in the footer (client).                                 |
| molecules | `AnimatedCard.tsx`   | Animated link card for the landing page (client).                         |
| molecules | `Figures.tsx`        | Figures of one section in a grid.                                         |
| molecules | `Qa.tsx`             | Native `<details>` question list (client, animated).                      |
| molecules | `Section.tsx`        | Section with an anchor id.                                                |
| organisms | `Navbar.tsx`         | Site header and three-way toggle (client).                                |
| templates | `TopicTemplate.tsx`  | Shared topic page (data-driven blocks).                                   |
| templates | `TopicsTemplate.tsx` | Shared grouped index (both subjects).                                     |

## Conventions

- **Bullet points, not paragraphs.** Every rule in this file is a bullet, and every sentence is short. Keep it that way when you edit this file.
- **Server components by default.** `Navbar.tsx`, `ThemeToggle.tsx`, `AnimatedCard.tsx`, `Qa.tsx`, `src/app/page.tsx`, `error.tsx` and `global-error.tsx` carry `'use client'` — they animate or use browser state. A new client component needs a reason.
- **Components are `FC`, pages are `NextPage`.** A component in `src/components` is `const Name: FC<Props> = ...`; a route in `src/app` is `const Name: NextPage = ...`, or `NextPage<{ params: Promise<Params> }>` when it takes params. `error.tsx` and `global-error.tsx` keep `FC` because `NextPage` does not model their `error`/`reset` props.
- **Content stays in `src/content`.** Components never import from each other to reach data.
- **Tailwind utilities, not CSS files.** The only global CSS is `globals.css`, and only for tokens and the two shared classes (`.glass`, `.toggle-pill`).
- **The toggle is the brand.** The icon in `public/icons` and the social card are the same three-segment bar as the navbar highlight. Change one, change all three.

## Templates details

- `TopicTemplate` renders one topic page.
- Both `[slug]` routes normalize their content into `TopicPageData` and render it.
- The page owns metadata, prev/next and the category label.
- The template owns the header, sidebar TOC, sections, footer and block rendering.
- `TopicSectionData` requires `blocks`; the template never knows which subject it is rendering.
- `theme` switches accent colours: `system-design` is cobalt, `design-system` is marker.
- `TopicsTemplate` renders a grouped index page for `/design-system` and `/system-design`.
- Keep both templates server components.
- The only client parts are the navbar, the landing page, `ThemeToggle`, `Qa` and `AnimatedCard`.
