import type { Topic } from '../index';
import { atoms, molecules, organisms, templates, pages } from './svg-generated';

export const atomicDesign: Topic = {
  slug: 'atomic-design',
  title: 'Atomic Design',
  tagline: 'The five-level hierarchy that structures design systems.',
  summary:
    'Atomic design is a methodology for creating design systems: atoms combine into molecules, molecules into organisms, organisms into templates, and templates into pages. This structure ensures consistency, scalability, and maintainability as a product grows.',
  group: 'structure',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      intro: 'A philosophy for building design systems.',
      body: 'Atomic design breaks down interfaces into fundamental building blocks. The five levels atoms molecules organisms templates and pages create a hierarchical system where each level is composed of the level below it. This ensures that everything built on top inherits consistency from the foundation. The key insight is that atoms are not just HTML elements; they are styled, stateful components that reference design tokens. Molecules are purposeful groups of atoms. Organisms are distinct interface regions. Templates define page structure, and pages are specific instances with real content.',
      rules: [
        'Atoms style exclusively from design tokens.',
        'Molecules own the layout between their atoms.',
        'Organisms accept data through props, not fetching inside the component.',
        'Templates use slots (props or children) instead of hard-coding content.',
        'Pages are specific instances of templates with real content.',
      ],
      visuals: [
        {
          title: 'The five levels of atomic design',
          caption: 'Atoms Molecules Organisms Templates Pages',
          svg: atoms,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'atoms',
      title: 'Atoms',
      intro: 'The smallest useful building blocks.',
      body: 'An atom is a single HTML-level element with styling and states: a button a text input a label an icon a badge a spinner. Atoms hold no business logic and know nothing about where they are used. They style exclusively from design tokens and ship with every state default hover focus active disabled loading error so everything built from them inherits a consistent baseline.',
      examples: [
        'Button link icon button',
        'Text input checkbox radio switch select',
        'Label heading paragraph badge avatar spinner',
      ],
      rules: [
        'Style only from tokens.',
        'Cover every state: default hover focus active disabled loading error.',
        'Accept className and standard HTML props so consumers are not blocked.',
        'Prefer headless primitives Radix React Aria for behaviour and keyboard support.',
      ],
      visuals: [
        {
          title: 'Atom examples',
          caption: 'Basic HTML elements that serve as the building blocks of the system.',
          svg: atoms,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'molecules',
      title: 'Molecules',
      intro: 'Small groups of atoms that do one job together.',
      body: 'A molecule combines a few atoms into something with a single clear purpose. A label an input and a hint become a form field. An input and a button become a search box. The test: if you can describe it in one short sentence without the word and it is probably a molecule.',
      examples: [
        'Form field label input hint error',
        'Search box input submit button',
        'Menu item icon label shortcut',
        'Stat number label trend',
      ],
      rules: [
        'Compose atoms. Do not restyle them from the inside.',
        'Own the layout between the atoms such as spacing and alignment.',
        'Link labels hints and errors with aria-describedby htmlFor.',
      ],
      visuals: [
        {
          title: 'Molecule examples',
          caption: 'Groups of atoms that form useful UI patterns.',
          svg: molecules,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'organisms',
      title: 'Organisms',
      intro: 'Larger sections made of molecules and atoms.',
      body: 'An organism is a distinct region of a screen: a site header a product card grid a data table a checkout form. It can hold state and talk to data but its visual building blocks all come from lower levels. Organisms are where components start to reflect your product so keep the data layer separate from the presentation. Pass data in through props and let the page decide where it comes from.',
      examples: [
        'Site header with navigation and search',
        'Data table with sorting filters and pagination',
        'Comment thread pricing table footer',
      ],
      rules: [
        'Accept data through props. Do not fetch inside the component.',
        'Handle empty loading and error states explicitly.',
        'Make it responsive from the start.',
      ],
      visuals: [
        {
          title: 'Organism examples',
          caption: 'Distinct regions of a screen built from lower-level components.',
          svg: organisms,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'templates',
      title: 'Templates',
      intro: 'Page-level layouts that place organisms and show the structure of content.',
      body: 'A template defines where things go: a header on top a sidebar on the left a content column a footer. It deals with grid spacing and responsive behaviour and it works with content of any length. Templates answer the question what does this layout do when the content is short long or missing?.',
      examples: [
        'Dashboard shell sidebar top bar main area',
        'Article layout with a table of contents',
        'Marketing page with full-width bands',
        'Settings page with a two-column form',
      ],
      rules: [
        'Use slots (props or children) instead of hard-coding content.',
        'Define behaviour at each breakpoint.',
        'Test it with the longest shortest and empty content you can imagine.',
      ],
      visuals: [
        {
          title: 'Template examples',
          caption: 'Page-level layouts that define structure without content.',
          svg: templates,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'pages',
      title: 'Pages',
      intro:
        'Templates filled with real content. The level where you test whether the system holds up.',
      body: 'A page is a specific instance of a template with real data. It is the final check: if a real page breaks the layout the fix belongs in the template or the organism not in a one-off override. Pages are usually owned by product teams not the design system. They import from the system and report what is missing.',
      examples: [
        'The signed-in dashboard for a customer with 300 projects',
        'A product page with a very long title and no image',
        'A checkout with a validation error on three fields',
      ],
      rules: [
        'Do not patch the system with local CSS. Fix the source.',
        'Turn repeated page-level patterns into new organisms or templates.',
        'Run visual tests on real content including edge cases.',
      ],
      visuals: [
        {
          title: 'Page examples',
          caption: 'Specific instances of templates with real content.',
          svg: pages,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying atomic design.',
      body: 'Start with the atoms that are most commonly used in your product. Build molecules from those atoms then organisms from molecules. Templates and pages emerge naturally as the system grows. Avoid creating atoms just for the sake of the framework every atom should have a purpose.',
      rules: [
        'Start with commonly used atoms.',
        'Build molecules intentionally, not by force.',
        'Organisms should reflect real interface regions.',
        'Templates define structure not specific pages.',
        'Pages are owned by product teams.',
      ],
      items: [
        {
          title: 'Do',
          body: 'Focus on real use cases. Atoms should have multiple states. Organisms should handle empty and loading states.',
        },
        {
          title: "Don't",
          body: 'Do not create atoms without a clear purpose. Do not hard-code content in templates.',
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Verify your atomic design implementation.',
      items: [
        {
          title: 'Hierarchy',
          body: 'Atoms Molecules Organisms Templates Pages follows a consistent structure.',
        },
        {
          title: 'Consistency',
          body: 'Atoms style from tokens. Molecules own their layout. Organisms accept data via props.',
        },
        {
          title: 'Responsiveness',
          body: 'Organisms and templates are responsive from the start. Pages adapt to content changes.',
        },
      ],
    },
  ],
};
