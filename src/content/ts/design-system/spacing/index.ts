import type { Topic } from '../index';
import { scale, layout, grid, density } from './svg-generated';

const spacingTokensCss = `:root {
  --space-0: 0;
  --space-0.5: 0.125rem; /* 2px */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}`;

const gridCss = `.container {
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding-inline: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-inline: var(--space-8);
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}`;

const componentExampleTsx = `// Card component using spacing tokens
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="card" style={{
      padding: "var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      marginBottom: "var(--space-8)"
    }}>
      {children}
    </div>
  );
}`;

export const spacing: Topic = {
  slug: 'spacing',
  title: 'Spacing',
  tagline: 'Consistent rhythm through a systematic spacing scale.',
  summary:
    'Spacing creates visual hierarchy, improves readability, and establishes rhythm. A systematic spacing scale based on a grid (like 4pt) ensures consistency, scalability, and harmony across all interfaces.',
  group: 'foundations',
  sections: [
    {
      id: 'philosophy',
      title: 'Spacing philosophy',
      intro: 'Spacing is a design element, not an afterthought.',
      body: "Consistent spacing is one of the most impactful ways to improve a design system. It creates relationships between elements, establishes hierarchy, and guides the eye through content. Good spacing feels invisible — you notice it when it's missing.\n\nThe key is to use a limited set of spacing values from a scale rather than arbitrary pixel values. This creates visual rhythm and makes designs more predictable and easier to maintain.",
      rules: [
        'Use spacing to create relationships and hierarchy.',
        'Stick to the spacing scale — avoid magic numbers.',
        'Be consistent with vertical rhythm.',
        'Consider density based on context.',
      ],
      visuals: [
        {
          title: '4pt spacing scale',
          caption:
            'A systematic scale based on multiples of 4px provides flexibility while maintaining consistency.',
          svg: scale,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'scale',
      title: 'The spacing scale',
      intro: 'A mathematical approach to spacing.',
      body: 'A 4pt grid is the industry standard for digital interfaces. Starting from a base unit of 4px, you can create a scale of values that cover all needs from tight internal padding to large section breaks.\n\nThe scale should be used for all spacing — margins, padding, gaps, and positioning. This creates a cohesive rhythm throughout the interface.',
      examples: [
        'space-0.5 (2px): Hairline borders, tight adjustments',
        'space-1 (4px): Icon-text alignment, micro-spacing',
        'space-2 (8px): Input padding, button padding, compact layouts',
        'space-3 (12px): Form field gaps, list item spacing',
        'space-4 (16px): Default padding, card padding, standard gaps',
        'space-6 (24px): Section spacing, card gaps',
        'space-8 (32px): Major section breaks',
        'space-12 (48px): Page section spacing',
        'space-16 (64px): Hero sections, large breaks',
      ],
      rules: [
        'Base unit is 4px (0.25rem).',
        'Use multiples of the base unit.',
        'Name tokens by purpose or by scale value.',
        'Limit to 12-16 values maximum.',
      ],
      code: {
        label: 'spacing-tokens.css',
        source: spacingTokensCss,
      },
    },
    {
      id: 'margin-padding',
      title: 'Margin, padding & gap',
      intro: 'Understanding the different types of spacing.',
      body: 'Each type of spacing serves a specific purpose. **Padding** creates space inside an element between its border and content. **Margin** creates space outside an element between it and other elements. **Gap** creates space between children in flexbox or grid layouts.\n\nUse padding for internal breathing room, margins for separation between components, and gaps for consistent spacing in layouts. Prefer gap over margins in flex/grid containers for more predictable layouts.',
      visuals: [
        {
          title: 'Margin, padding, and gap',
          caption:
            'Visual demonstration of how each spacing type affects layout and relationships.',
          svg: layout,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      rules: [
        'Use padding to increase clickable area and internal breathing room.',
        'Use margin to create separation between sibling elements.',
        'Use gap for spacing in flexbox and grid layouts.',
        'Prefer gap over adding margins to flex/grid children.',
        'Be consistent with spacing direction (usually top/bottom or rely on flow).',
      ],
    },
    {
      id: 'grid',
      title: 'Grid & layout',
      intro: 'Structured layouts with consistent spacing.',
      body: 'A grid system provides structure and alignment. Combine grid with the spacing scale for gutters, margins, and content spacing. A 12-column grid is flexible for most layouts, while CSS Grid and Flexbox can create custom layouts.\n\nUse consistent gutters (typically space-4 or space-6) and container max-widths to maintain readability across screen sizes.',
      visuals: [
        {
          title: '12-column grid layout',
          caption:
            'Flexible column spanning with consistent gutters creates responsive, aligned layouts.',
          svg: grid,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      examples: [
        'Gutter: space-4 (16px) for mobile, space-6 (24px) for desktop',
        'Container padding: space-4 mobile, space-6 tablet, space-8 desktop',
        'Section spacing: space-12 to space-24 between major sections',
        'Card padding: space-4 or space-6 depending on content density',
      ],
      rules: [
        'Define grid columns, gutters, and breakpoints once.',
        'Use the spacing scale for all grid-related spacing.',
        'Align to the grid wherever possible.',
        'Maintain consistent container margins.',
      ],
      code: {
        label: 'grid.css',
        source: gridCss,
      },
    },
    {
      id: 'density',
      title: 'Density & context',
      intro: 'Adjust spacing based on use case.',
      body: 'Not all interfaces need the same amount of breathing room. Dense interfaces like data tables or admin dashboards benefit from tighter spacing to show more information. Consumer-facing apps often need more generous spacing for better readability and touch targets.\n\nProvide density modes or choose appropriate spacing based on context. The same component can use different spacing tokens for compact vs comfortable variants.',
      visuals: [
        {
          title: 'Spacing density comparison',
          caption:
            'Compact, default, and comfortable densities use different spacing values for different contexts.',
          svg: density,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
      examples: [
        'Compact (admin tables): space-1 to space-3 for tight layouts',
        'Default (product UI): space-2 to space-4 for balanced layouts',
        'Comfortable (marketing): space-4 to space-8 for generous breathing room',
        'Mobile: often tighter spacing than desktop',
      ],
      rules: [
        'Consider information density needs.',
        'Maintain touch target sizes (minimum 44x44px) even in compact modes.',
        'Be consistent within a context.',
        'Provide density as a system option when needed.',
      ],
    },
    {
      id: 'vertical-rhythm',
      title: 'Vertical rhythm',
      intro: 'Creating harmonious vertical flow.',
      body: 'Vertical rhythm keeps text and elements aligned to a baseline grid. For body text with line-height, your spacing should relate to that rhythm. A common approach is to use spacing values that are multiples related to your base line-height.\n\nConsistent vertical rhythm improves readability and creates a sense of order. Stack related elements with smaller gaps, and separate sections with larger gaps.',
      examples: [
        'Between label and input: space-1 or space-2',
        'Between form fields: space-4 or space-6',
        'Between paragraphs: space-4',
        'Between sections: space-8, space-12, or space-16',
        'Between page header and content: space-6 or space-8',
      ],
      rules: [
        'Use larger spacing to separate unrelated groups.',
        'Use smaller spacing to relate elements together.',
        'Follow the principle of proximity.',
        'Maintain consistency with line-height.',
      ],
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying spacing effectively.',
      body: 'Start with the spacing scale and only deviate when necessary with justification. Use a spacing multiplier or stick to the predefined values. In CSS, prefer logical properties and use rem units for scalability.',
      rules: [
        'Use the scale for all spacing decisions.',
        'Avoid hard-coded pixel values.',
        'Use rem units (1rem = 16px by default).',
        'Prefer gap in flex/grid layouts.',
        'Use padding for internal space, margin for external space.',
        'Consider responsive spacing (smaller on mobile).',
        'Test layouts at different zoom levels.',
      ],
      code: {
        label: 'component-example.tsx',
        source: componentExampleTsx,
      },
      items: [
        {
          title: 'Do',
          body: 'Use space-4 for default padding. Use larger gaps to separate sections. Stack related items with space-2 or space-3.',
        },
        {
          title: "Don't",
          body: "Don't use random values like 13px or 17px. Don't add margin to every child in a flex container when gap works. Don't forget mobile spacing adjustments.",
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Verify your spacing implementation.',
      items: [
        {
          title: 'Scale',
          body: 'All spacing uses values from the 4pt scale. No magic numbers in styles. Tokens are defined and documented.',
        },
        {
          title: 'Layout',
          body: 'Consistent gutters and padding. Proper use of margin/padding/gap. Grid system is applied correctly.',
        },
        {
          title: 'Hierarchy',
          body: 'Related elements are grouped with tight spacing. Unrelated elements separated with more space. Clear visual rhythm.',
        },
        {
          title: 'Responsive',
          body: 'Spacing adapts across breakpoints. Touch targets remain adequate. Readable at all screen sizes.',
        },
      ],
    },
  ],
};
