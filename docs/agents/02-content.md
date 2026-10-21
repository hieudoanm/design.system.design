# Content

- Content is plain TypeScript, not markdown files.
- Shared normalized types live in `src/content/ts/types.ts` (`TopicBlock`, `TopicSectionData`, `TopicPageData`, `TopicVisual`, `TopicTable`, `TopicItem`, `TopicQa`, `TopicTheme`).
- Both slug pages use `TopicTemplate` and normalize their source content into blocks (single column; visuals render inside their section).

## Shapes

```ts
type Topic = {
  slug: string;
  title: string;
  tagline: string; // one line, used on the index card
  summary: string; // long-form intro
  group: TopicGroupId; // which of the five groups it belongs to
  sections: TopicSection[];
};

type TopicSection = {
  id: string; // anchor id, also the TOC key
  title: string;
  intro?: string; // one line under the heading
  blocks?: TopicBlock[]; // preferred (normalized in template)
  // Legacy fields (supported for backward compatibility):
  body?: string; // long form, supports `code`, **bold**, [links], paragraphs
  items?: { title: string; body: string }[]; // definition-style pairs
  examples?: string[]; // bullet list
  rules?: string[]; // bullet list
  code?: { label: string; source: string };
  visuals?: TopicVisual[]; // drawings, rendered inside the section
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
  tags: string[];
  group: ProblemGroupId; // which of the six groups it belongs to
  functional: string[];
  nonFunctional: string[];
  estimation: string[]; // back-of-the-envelope numbers
  diagram: string; // ASCII architecture diagram
  design: Block[]; // { title, body }
  qa: { q: string; a: string }[];
};
```

## Design system content

- `src/content/ts/design-system/` holds one folder per group (6 groups × 4 topics), plus `index.ts`:

| Group         | Folder         | Topics (4 each)                                           |
| ------------- | -------------- | --------------------------------------------------------- |
| Foundations   | `foundations/` | `design-tokens`, `colors`, `typography`, `spacing`        |
| Structure     | `structure/`   | `atomic-design`, `layout`, `elevation`, `icongraphy`      |
| Data & charts | `data-charts/` | `charts`, `scientific-charts`, `data-display`, `feedback` |
| Interaction   | `interaction/` | `animation`, `forms`, `navigation`, `overlays`            |
| Practice      | `practice/`    | `accessibility`, `responsive`, `theming`, `governance`    |
| Specialized   | `specialized/` | `color-science`, `component-api`, `data-grids`, `i18n`    |

- Each topic is a folder with an `index.ts` exporting one `Topic`.
- Group folders have an `index.ts` barrel exporting their four topics.
- Root `index.ts` imports from group barrels and assembles the `topics` array.
- `topicGroups` in `index.ts` defines the six groups in reading order.
- A topic declares its group with the `group` field.
- `/design-system` renders one section per group, in `topicGroups` order.
- The array order inside a group drives the reading order.
- The group id is the section anchor id on that page.
- A topic with drawings is a folder:
  - `index.ts` holds the prose, the data arrays and the tables.
  - `svg/*.svg` holds one file per drawing.
  - `svg-generated.ts` is generated from `svg/` and must not be edited.
- A topic without drawings stays a single `.ts` file.
- `index.ts` is the only place the list is assembled.
- Topic files import their type with `import type { Topic } from '../index'`.
- The import is erased at compile time, so there is no runtime cycle.

## Blocks

- `TopicTemplate` renders a page as sections; each section is a list of blocks.
- Block types (see `src/content/ts/types.ts`):
  - `prose` — long form, rendered by `Rich.tsx`.
  - `code` — labelled code, rendered by `Code.tsx`.
  - `list` — bullet list with an optional title.
  - `items` — definition-style pairs (`title` + `body`).
  - `examples` / `rules` — bullet lists with those headings.
  - `qa` — `<details>` list, rendered by `Qa.tsx`.
  - `visuals` — drawings, rendered by `Figures.tsx`.
- Blocks stack in a single column; do not reintroduce a two-column text + code layout.
- `Rich.tsx` renders the tiny markdown subset: `` `code` ``, `**bold**`, `[label](href)` and paragraphs separated by a blank line.
- A block whose lines all start with `- ` renders as a bullet list.
- It is deliberately not a full markdown parser.

## Figures

- `visuals` are the drawings; a section that has them maps them to a `visuals` block.
- `Figure.tsx` renders one as a `<figure>`: a caption, the inline SVG and — when the visual carries data — the table of that data.
- `Figures.tsx` lays a section's figures out in two columns on a wide screen.
- `full: true` spans both columns.
- Figures are the exception to the single-column rule; text and code stay stacked.
- The SVG is a file under the topic's `svg/` folder, and it is trusted content.
- It is injected with `dangerouslySetInnerHTML`.
- `scripts/ts/generate-svg.mts` turns every `svg/*.svg` into the matching `svg-generated.ts`, which `index.ts` imports.
- Run it after adding or editing a drawing: `node scripts/ts/generate-svg.mts`.
- Pass a topic to regenerate one: `node scripts/ts/generate-svg.mts charts`.
- Five rules keep it honest:
  - **Colour comes from a token.** `style='fill:var(--color-chart-1)'`, never a hex value. `var()` resolves inside a `style` attribute only, never in an SVG presentation attribute.
  - **Every drawing has a `<title>`** with an `id`, pointed at by `role='img'` and `aria-labelledby`, so it is announced instead of ignored.
  - **Title ids are namespaced.** They share a page with the section anchor ids, so prefix them: `chart-`, `font-`, `screen-`, `animation-`, `scientific-`, `icon-`. A duplicate id breaks `aria-labelledby`.
  - **A drawing and its table show the same numbers.** The data array in `index.ts` builds the table; the `.svg` file draws the same values. Change one, change the other.
  - **The ink stays inside the viewBox.** Draw within it and check `getBBox()` in the browser. Text is the usual thing that runs past the edge.

## Adding a design system chapter

1. Create `src/content/ts/design-system/<group>/<slug>/index.ts` exporting one `Topic`.
2. Give it a `group` — one of the six ids in `topicGroups`.
3. Add it to the group's `index.ts` barrel.
4. Add it to the `topics` array in `src/content/ts/design-system/index.ts`. The array order drives the previous/next links and the order within its group.
5. Add `/design-system/<slug>` to `public/sitemap.xml`.

- New sections should use `blocks`.
- The `[slug]` page converts legacy flat fields (`body`, `items`, `examples`, `rules`, `code`, `visuals`) to blocks, so old chapters keep working.
- Prefer one idea per block; the template stacks them in a single column.
- Put `visuals` on the section; the page appends them as a `visuals` block.
- Put the `Topic` in `<group>/<slug>/index.ts` with `import type { Topic } from '../../../index'`.
- Put each drawing in `<group>/<slug>/svg/<name>.svg`.
- Run `node scripts/ts/generate-svg.mts <group>/<slug>` to write `<group>/<slug>/svg-generated.ts`.
- Import the drawings from `./svg-generated` in `<group>/<slug>/index.ts`.
- The index page and the `[slug]` page both read `topics`.
- Both pick it up automatically.

## System design content

- `src/content/ts/system-design/` holds one folder per group, each with four problems, plus `index.ts` and `types.ts`:

| Group                    | Folder                    | Problems (4 each)                                                                                         |
| ------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------- |
| Foundations              | `foundations/`            | `url-shortener`, `rate-limiter`, `unique-id-generator`, `key-value-store`                                 |
| Consumer products        | `consumer-products/`      | `twitter-x-feed`, `instagram-photo-sharing`, `youtube-video-sharing`, `uber-ride-hailing`                 |
| Collaboration & commerce | `collaboration-commerce/` | `chat-system`, `notification-service`, `dropbox-file-sync`, `google-docs-collaboration`                   |
| Search & media           | `search-media/`           | `autocomplete-typeahead`, `recommendation-system`, `stripe-payments`, `ticketmaster-event-booking`        |
| Building blocks          | `building-blocks/`        | `distributed-cache`, `distributed-lock-service`, `distributed-message-queue`, `web-crawler-search-engine` |
| Platform services        | `platform-services/`      | `api-gateway`, `content-delivery-network`, `load-balancer`, `service-discovery`                           |

- Each problem is a `<slug>.ts` file inside its group folder, exporting one `Problem`.
- Group folders have an `index.ts` barrel exporting their four problems.
- Root `index.ts` imports from group barrels and assembles the `problems` array.
- `types.ts` defines the `Problem` type and is imported by all problem files.

## Adding a system design problem

1. Create `src/content/ts/system-design/<group>/<slug>.ts` exporting one `Problem`.
2. Give it a `group` — one of the six ids in `problemGroups`.
3. Add it to the group's `index.ts` barrel.
4. Add it to the `problems` array in `src/content/ts/system-design/index.ts`. The array order drives the "next problem" link and the order within its group.
5. Add `/system-design/<slug>` to `public/sitemap.xml`.

- The six groups live in `problemGroups` in `index.ts`, four problems each.
- `/system-design` renders one section per group, in `problemGroups` order.
- The group id is the section anchor id on that page.
- `problemsByGroup()` returns the problems of one group, in reading order.
- The `[slug]` page maps every problem to the same five sections: Requirements, Estimation, Architecture, Design decisions, Questions and answers.
- Requirements are two `list` blocks (Functional, Non-functional), not a two-column layout.
- Architecture is a `diagram` block (mermaid); design decisions are an `items` block; Q&A is a `qa` block.
- All 24 problems now use mermaid diagrams for Architecture.
