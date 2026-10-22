import type { Topic } from '../index';

const responsiveNavTs = `import { useEffect } from 'react';

export function useResponsiveNav(breakpoints: { md: number; lg: number }) {
  const [mode, setMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const updateMode = () => {
      const width = window.innerWidth;
      if (width >= breakpoints.lg) setMode('desktop');
      else if (width >= breakpoints.md) setMode('tablet');
      else setMode('mobile');
    };
    updateMode();
    window.addEventListener('resize', updateMode);
    return () => window.removeEventListener('resize', updateMode);
  }, [breakpoints]);

  return mode;
}

function TopNav({ mode }: { mode: 'desktop' | 'tablet' | 'mobile' }) {
  if (mode === 'desktop') return <nav>...</nav>;
  if (mode === 'tablet') return <HamburgerMenu />;
  return <BottomNav />;
}

export function ResponsiveNav() {
  const mode = useResponsiveNav({ md: 768, lg: 1024 });
  return <TopNav mode={mode} />;
}`;

const accessibleNavTs = `<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/">Home</a>
    </li>
    {/* ... more items ... */}
  </ul>
</nav>

<button aria-haspopup="true" aria-expanded={isOpen} onClick={toggle}>
  <MenuIcon aria-label="Open menu" />
</button>

<ul role="menu" hidden={!isOpen}>
  {/* ... menu items ... */}
</ul>`;

export const navigation: Topic = {
  slug: 'navigation',
  title: 'Navigation',
  tagline: 'Headers, sidebars, tabs, breadcrumbs and more.',
  summary:
    'Navigation is the roadmap of your interface. It guides users through content and between pages. Good navigation is discoverable, consistent and works at every screen size — from a vertical sidebar on desktop to a bottom navigation bar on mobile.',
  group: 'interaction',
  sections: [
    {
      id: 'philosophy',
      title: 'Navigation philosophy',
      intro: 'Navigation should be predictable and accessible.',
      body: 'Navigation patterns should follow user expectations. Global navigation (headers, sidebars) helps users move between major sections. Local navigation (breadcrumbs, tabs) helps them move within a section. Mobile navigation should be touch-friendly and progressive. The key principle: never make users guess where they are or how to get where they want to go.',
      rules: [
        'Always indicate the current location.',
        'Make visited links distinguishable.',
        'Use clear and concise labels.',
        'Never hide navigation behind hover on desktop.',
        'Provide keyboard access to all navigation items.',
      ],
      visuals: [
        {
          title: 'Navigation atoms, molecules, organisms and templates',
          caption: 'The full hierarchy of navigation components from atoms to pages.',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Navigation</text><rect x="60" y="70" width="120" height="60" rx="8" fill="var(--color-action-bg)"/><text x="120" y="95" font-size="9" fill="var(--color-ink)">atoms</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'atoms',
      title: 'Atoms',
      intro: 'The smallest navigation building blocks.',
      body: 'Navigation atoms are the fundamental HTML elements and UI primitives that make up navigation: buttons, links, icons, and badges. Each atom ships with every state (default, hover, focus, active, disabled) and styles from design tokens.',
      examples: [
        'Icon button, text button, ghost button',
        'Link, external link, nav link',
        'Hamburger menu icon, close icon',
        'Badge, pill, tag',
      ],
      rules: [
        'Style only from design tokens.',
        'Provide visible focus indicators.',
        'Cover all states: default, hover, focus, active, disabled.',
        'Prefer headless primitives for behaviour.',
      ],
      visuals: [
        {
          title: 'Navigation atom examples',
          caption: 'Basic building blocks: buttons, links, icons, badges.',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Atoms</text><rect x="60" y="70" width="120" height="60" rx="8" fill="var(--color-action-bg)"/><text x="120" y="95" font-size="9" fill="var(--color-ink)">button</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'molecules',
      title: 'Molecules',
      intro: 'Small groups of atoms that form useful navigation patterns.',
      body: 'Navigation molecules combine atoms into purposeful groups. A button and icon become a menu trigger. A link and separator become a nav divider. An input and button become a search form. The test: if you can describe its purpose in one short sentence, it is probably a molecule.',
      examples: [
        'Menu trigger (button + hamburger icon)',
        'Search form (input + button)',
        'Nav divider (link + horizontal rule)',
        'Tab (label + indicator)',
      ],
      rules: [
        'Compose atoms. Do not restyle them from the inside.',
        'Own the layout between the atoms (spacing, alignment).',
        'Link labels and hints with appropriate ARIA attributes.',
      ],
      visuals: [
        {
          title: 'Navigation molecule examples',
          caption: 'Groups of atoms that form useful navigation patterns.',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Molecules</text><rect x="60" y="70" width="160" height="50" rx="8" fill="var(--color-action-bg)"/><text x="140" y="95" font-size="9" fill="var(--color-ink)">menu trigger</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'organisms',
      title: 'Organisms',
      intro: 'Larger navigation regions made of molecules and atoms.',
      body: 'Navigation organisms are distinct interface regions: a horizontal navbar, a vertical sidebar, a breadcrumb trail, a tab bar. They can hold state (open/closed, selected/deselected) and accept data through props, but their visual building blocks all come from lower levels.',
      examples: [
        'Horizontal top navigation bar',
        'Vertical sidebar with sub-navigation',
        'Breadcrumb trail (Home > Products > Widgets)',
        'Tabbed interface (3-5 tabs)',
      ],
      rules: [
        'Accept data through props. Do not fetch inside the component.',
        'Handle open, closed and selected states explicitly.',
        'Make it responsive from the start.',
      ],
      visuals: [
        {
          title: 'Navigation organism examples',
          caption: 'Distinct regions of navigation built from lower-level components.',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Organisms</text><rect x="60" y="70" width="200" height="60" rx="8" fill="var(--color-surface)" stroke="var(--color-rule)" stroke-width="1"/><text x="160" y="95" font-size="9" fill="var(--color-ink)">main header</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'templates',
      title: 'Templates',
      intro: 'Page-level layouts that place navigation organisms and show the structure.',
      body: 'A navigation template defines where navigation goes: a header on top with a logo and global nav, a sidebar on the left with section nav, a bottom bar with utility links. It deals with grid, spacing and responsive behaviour. Templates answer the question "what does this layout do when the navigation is open, closed, or on mobile?".',
      examples: [
        'Header template (logo + global nav + actions)',
        'Sidebar template (section nav + subnav + actions)',
        'Footer template (utility links + copyright)',
      ],
      rules: [
        'Use slots (props or children) instead of hard-coding content.',
        'Define behaviour at each breakpoint.',
        'Test with the longest and shortest navigation labels.',
      ],
      visuals: [
        {
          title: 'Navigation template examples',
          caption: 'Page-level layouts that define structure without specific content.',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Templates</text><rect x="60" y="70" width="240" height="60" rx="8" fill="var(--color-surface)" opacity="0.5"/><text x="180" y="95" font-size="9" fill="var(--color-ink)">marketing layout</text></svg>',
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
        'Templates filled with real navigation content. The level where you test whether the system holds up.',
      body: 'A page is a specific instance of a navigation template with real data and content. It is the final check: if a real page breaks the layout or the navigation does not work on a given screen size, the fix belongs in the template or organism, not in a one-off override. Pages are usually owned by product teams, not the design system. They import from the system and report what is missing.',
      examples: [
        'The signed-in dashboard with a vertical sidebar and breadcrumb trail',
        'A product page with a horizontal top nav and context-aware tabs',
        'A checkout flow with a persistent mini-cart and checkout nav',
      ],
      rules: [
        'Do not patch the system with local CSS. Fix the source.',
        'Turn repeated navigation patterns into new organisms or templates.',
        'Run visual tests on real content, including edge cases.',
      ],
      visuals: [
        {
          title: 'Navigation page examples',
          caption: 'Specific instances of templates with real content and navigation.',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Pages</text><rect x="60" y="70" width="280" height="60" rx="8" fill="var(--color-surface)" opacity="0.3"/><text x="200" y="95" font-size="9" fill="var(--color-ink)">marketing page with nav</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'responsive',
      title: 'Responsive navigation',
      intro: 'Navigation that works at every screen size.',
      body: 'Responsive navigation is not just "hide/show". It is a deliberate change in pattern based on screen size. Common patterns: horizontal top nav → hamburger menu → bottom navigation bar. The key is to orchestrate the transition so users never lose their place or have to re-learn where things are.',
      examples: [
        'Desktop: horizontal navbar with 5 links',
        'Tablet: hamburger menu reveals vertical list',
        'Mobile: bottom navigation bar with 3-5 primary destinations',
      ],
      rules: [
        'Choose one pattern per breakpoint, do not mix.',
        'Animate the transition between patterns.',
        'Test that focus order is preserved when nav is shown/hidden.',
        'Ensure the current page is always indicated.',
      ],
      code: {
        label: 'responsive-nav.ts',
        source: responsiveNavTs,
      },
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      intro: 'Navigation must work for everyone.',
      body: 'Navigation is a primary way users explore your product. It must be operable via keyboard and screen reader friendly, and work in high contrast modes. All navigation items need focus indicators, meaningful link text, and appropriate ARIA labels for icons.',
      rules: [
        'Every navigation item is keyboard-focusable (Tab order).',
        'Focus indicator is visible in all themes and forced-colors mode.',
        'Screen reader text for icon-only buttons (e.g. via aria-label).',
        'Use `nav` element for top-level navigation and `ul`/`ol` for lists.',
        'Avoid complex dropdown patterns without proven accessible implementations.',
      ],
      code: {
        label: 'accessible-nav.tsx',
        source: accessibleNavTs,
      },
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying navigation patterns consistently.',
      body: 'Start with the simplest pattern that works. Add responsive breakpoints only when the label lengths or use cases demand it. Use the token system for colors and spacing. Test navigation with a keyboard, a screen reader, and on real devices at every breakpoint.',
      rules: [
        'Start simple. Add responsiveness only when needed.',
        'Use semantic HTML first (<nav>, <ul>, <li>, <a>).',
        'Test with keyboard only, then screen reader, then on real devices.',
        'Always indicate the current page/location.',
      ],
      items: [
        {
          title: 'Do',
          body: 'Use focus indicators. Test with Keyboard Only™. Indicate current location.',
        },
        {
          title: "Don't",
          body: 'Do not hide navigation behind hover on desktop. Do not skip focus states.',
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping your navigation system.',
      items: [
        {
          title: 'Hierarchy',
          body: 'Global → local → contextual navigation follows a consistent structure.',
        },
        {
          title: 'Consistency',
          body: 'Atoms style from tokens. Molecules compose atoms. Organisms accept data via props.',
        },
        {
          title: 'Responsiveness',
          body: 'Nav works at every breakpoint. Transitions are animated. Current page is always indicated.',
        },
        {
          title: 'Accessibility',
          body: 'Keyboard operable. Screen reader friendly. Focus indicators visible in all modes.',
        },
      ],
    },
  ],
};
