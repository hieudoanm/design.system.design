/**
 * Atomic design — the spine of the design system.
 *
 * The five levels below are the ladder a component library climbs: each level
 * only depends on the ones under it. Design tokens sit beneath atoms as the
 * shared foundation. Everything else in this folder is a deep dive on one
 * concern (tokens, type, charts, accessibility, responsive).
 */

export type AtomicLevel = {
  id: string;
  name: string;
  summary: string;
  body: string;
  examples: string[];
  rules: string[];
  code: { label: string; source: string };
};

export type Principle = {
  title: string;
  body: string;
};

export type Practice = {
  id: string;
  title: string;
  body: string;
};

export const atomicLevels: AtomicLevel[] = [
  {
    id: 'atoms',
    name: 'Atoms',
    summary:
      'The smallest useful building blocks. They cannot be broken down further without losing their purpose.',
    body: 'An atom is a single HTML-level element with styling and states: a button, a text input, a label, an icon, a badge, a spinner. Atoms hold no business logic and know nothing about where they are used. They style exclusively from design tokens and ship with every state (default, hover, focus, active, disabled, loading, error) so everything built from them inherits a consistent baseline.',
    examples: [
      'Button, link, icon button',
      'Text input, checkbox, radio, switch, select',
      'Label, heading, paragraph, badge, avatar, spinner',
    ],
    rules: [
      'Style only from tokens.',
      'Cover every state: default, hover, focus, active, disabled, loading, error.',
      'Accept `className` and standard HTML props so consumers are not blocked.',
      'Prefer headless primitives (Radix, React Aria) for behaviour and keyboard support.',
    ],
    code: {
      label: 'Button.tsx',
      source: `type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      data-variant={variant}
      data-size={size}
      className={cn("btn", className)}
      {...props}
    />
  );
}`,
    },
  },
  {
    id: 'molecules',
    name: 'Molecules',
    summary: 'Small groups of atoms that do one job together.',
    body: 'A molecule combines a few atoms into something with a single, clear purpose. A label, an input and a hint become a form field. An input and a button become a search box.\n\nThe test: if you can describe it in one short sentence without the word "and", it is probably a molecule.',
    examples: [
      'Form field (label, input, hint, error)',
      'Search box (input and submit button)',
      'Menu item (icon, label, shortcut)',
      'Stat (number, label, trend)',
    ],
    rules: [
      'Compose atoms. Do not restyle them from the inside.',
      'Own the layout between the atoms, such as spacing and alignment.',
      'Link labels, hints and errors with `aria-describedby` and `htmlFor`.',
    ],
    code: {
      label: 'FormField.tsx',
      source: `export function FormField({ label, hint, error, children }: FormFieldProps) {
  const id = useId();
  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, { id, "aria-invalid": !!error, "aria-describedby": id + "-msg" })}
      <p id={id + "-msg" className={error ? "field-error" : "field-hint"}>
        {error ?? hint}
      </p>
    </div>
  );
}`,
    },
  },
  {
    id: 'organisms',
    name: 'Organisms',
    summary:
      'Larger sections made of molecules and atoms. Each one is a recognisable part of an interface.',
    body: 'An organism is a distinct region of a screen: a site header, a product card grid, a data table, a checkout form. It can hold state and talk to data, but its visual building blocks all come from lower levels.\n\nOrganisms are where components start to reflect your product, so keep the data layer separate from the presentation. Pass data in through props and let the page decide where it comes from.',
    examples: [
      'Site header with navigation and search',
      'Data table with sorting, filters and pagination',
      'Comment thread, pricing table, footer',
    ],
    rules: [
      'Accept data through props. Do not fetch inside the component.',
      'Handle empty, loading and error states explicitly.',
      'Make it responsive from the start.',
    ],
    code: {
      label: 'PricingTable.tsx',
      source: `export function PricingTable({ plans }: { plans: Plan[] }) {
  if (plans.length === 0) return <EmptyState title="No plans yet" />;
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <li key={plan.id}>
          <PlanCard plan={plan} />
        </li>
      ))}
    </ul>
  );
}`,
    },
  },
  {
    id: 'templates',
    name: 'Templates',
    summary:
      'Page-level layouts that place organisms and show the structure of content, using placeholder content.',
    body: 'A template defines where things go: a header on top, a sidebar on the left, a content column, a footer. It deals with grid, spacing and responsive behaviour, and it works with content of any length.\n\nTemplates answer the question "what does this layout do when the content is short, long or missing?"',
    examples: [
      'Dashboard shell (sidebar, top bar, main area)',
      'Article layout with a table of contents',
      'Marketing page with full-width bands',
      'Settings page with a two-column form',
    ],
    rules: [
      'Use slots (props or children) instead of hard-coding content.',
      'Define behaviour at each breakpoint.',
      'Test it with the longest, shortest and empty content you can imagine.',
    ],
    code: {
      label: 'DashboardTemplate.tsx',
      source: `export function DashboardTemplate({ nav, header, children }: Props) {
  return (
    <div className="shell">
      <aside className="shell-nav">{nav}</aside>
      <div className="shell-main">
        <header>{header}</header>
        <main id="content">{children}</main>
      </div>
    </div>
  );
}`,
    },
  },
  {
    id: 'pages',
    name: 'Pages',
    summary:
      'Templates filled with real content. The level where you test whether the system holds up.',
    body: 'A page is a specific instance of a template with real data. It is the final check: if a real page breaks the layout, the fix belongs in the template or the organism, not in a one-off override.\n\nPages are usually owned by product teams, not the design system. They import from the system and report what is missing.',
    examples: [
      'The signed-in dashboard for a customer with 300 projects',
      'A product page with a very long title and no image',
      'A checkout with a validation error on three fields',
    ],
    rules: [
      'Do not patch the system with local CSS. Fix the source.',
      'Turn repeated page-level patterns into new organisms or templates.',
      'Run visual tests on real content, including edge cases.',
    ],
    code: {
      label: 'app/projects/page.tsx',
      source: `export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <DashboardTemplate nav={<MainNav />} header={<PageHeader title="Projects" />}>
      <ProjectTable projects={projects} />
    </DashboardTemplate>
  );
}`,
    },
  },
];

export const principles: Principle[] = [
  {
    title: 'Tokens, not values',
    body: 'Anything visual that can change is a token. Hard-coded values are bugs waiting to happen.',
  },
  {
    title: 'Composition over configuration',
    body: 'Small parts that fit together beat one component with thirty props. If a prop list keeps growing, split the component.',
  },
  {
    title: 'Constrain on purpose',
    body: 'A system is useful because it says no. A limited set of sizes, colours and variants makes decisions faster and results more consistent.',
  },
  {
    title: 'Document the why',
    body: 'Show when to use a component and when not to, with real examples. Usage guidance saves more time than an API table.',
  },
  {
    title: 'Treat it as a product',
    body: 'It has users (designers and developers), a roadmap, versions, support and a way to contribute. Without owners it decays.',
  },
];

export const practice: Practice[] = [
  {
    id: 'versioning',
    title: 'Versioning and releases',
    body: 'Publish tokens and components as packages and follow semantic versioning: a removed prop or renamed token is a major release. Use Changesets to generate release notes. Deprecate before you delete, with a codemod where you can.',
  },
  {
    id: 'testing',
    title: 'Testing',
    body: 'Unit-test behaviour with Testing Library. Add visual regression tests for every state of every component (Chromatic or Playwright screenshots). Run axe in CI. A system is only trusted when updates do not break products.',
  },
  {
    id: 'docs',
    title: 'Documentation',
    body: "Each component gets a short description, live examples for every variant and state, do and don't guidance, accessibility notes and an API table. Generate what you can from the TypeScript types so it does not go stale.",
  },
  {
    id: 'governance',
    title: 'Governance and contribution',
    body: 'Decide who owns the system, how a proposal is made, and when something moves from a product into the system. A good rule: a pattern needs to appear in two or three places before it is promoted. Keep a public roadmap and an issue template for requests.',
  },
];

export const repoStructure = `packages/
  tokens/        JSON source, Style Dictionary build ─► CSS, JS, others
  ui/            atoms, molecules, organisms, templates
    src/
      atoms/
      molecules/
      organisms/
      templates/
      index.ts   single public entry point
  docs/          documentation site and live examples
apps/
  web/           product pages that consume @scope/ui`;

/** The "components" topic: atomic design plus the habits around it. */
export const components = {
  slug: 'components',
  title: 'Components',
  tagline: 'Atomic design: atoms, molecules, organisms, templates and pages.',
  summary:
    'A design system is a set of tokens, components and guidelines that lets many people build a consistent product quickly. Atomic design gives it a shape: small parts combine into bigger ones, and each layer only depends on the layers below it. Design tokens sit beneath atoms as the shared foundation.',
  sections: [
    {
      id: 'principles',
      title: 'Principles',
      intro: 'Rules of thumb that decide most of the small calls.',
      items: principles.map((p) => ({ title: p.title, body: p.body })),
    },
    ...atomicLevels.map((level) => ({
      id: level.id,
      title: level.name,
      intro: level.summary,
      body: level.body,
      examples: level.examples,
      rules: level.rules,
      code: level.code,
    })),
    {
      id: 'practice',
      title: 'Keeping it healthy',
      intro: 'Layers get you started. These habits keep the system useful after year one.',
    },
    ...practice.map((p) => ({
      id: `practice-${p.id}`,
      title: p.title,
      body: p.body,
    })),
    {
      id: 'structure',
      title: 'Repo structure',
      intro: 'A monorepo layout that matches the layers.',
      code: { label: 'layout', source: repoStructure },
    },
  ],
};
