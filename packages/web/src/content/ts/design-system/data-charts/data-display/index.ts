import type { Topic } from '../../index';
import { table_anatomy, sort_filter, selection, pagination, empty_state } from './svg-generated';

const tableExampleTsx = `\`\`\`tsx\n// Simple table using data display tokens\nexport function Table({ columns, rows }: { columns: string[]; rows: string[][] }) {\n  return (\n    <table>\n      <thead>\n        <tr>\n          {columns.map(col => (\n            <th key={col} style={{ padding: \\"var(--space-4)\\" }}>\n              {col}\n            </th>\n          ))}\n        </tr>\n      </thead>\n      <tbody>\n        {rows.map((row, rowIndex) => (\n          <tr\n            style={{ backgroundIndex: rowIndex % 2 ? \\"var(--color-surface)\\" : \\"transparent\\" }}\n            onMouseOver={{ style: { boxShadow: \\"var(--shadow-sm)\\" } }}\n            onMouseOut={{ style: { boxShadow: \\"none\\" } }}\n          >\n            {row.map(cell => (\n              <td key={cell} style={{ padding: \\"var(--space-4)\\" }}>\n                {cell}\n              </td>\n            ))}\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  );\n\`\`\`\n`;

export const dataDisplay: Topic = {
  slug: 'data-display',
  title: 'Data display',
  tagline: 'Tables, lists and data density.',
  summary:
    'Data display components present information in structured, readable formats. Tables and lists are the primary ways users interact with large datasets, and they must be usable, accessible, and adaptable to different screen sizes.',
  group: 'data-charts',
  sections: [
    {
      id: 'philosophy',
      title: 'Data display philosophy',
      intro: 'Present data clearly, never hide it.',
      body: 'Tables and lists are the primary ways users interact with large datasets. A good data display system makes it easy to scan, sort, filter, and select information. It should work across all screen sizes, from phone to television, and be accessible to keyboard and screen reader users.\n\nThe key principle is to separate structure from style. Use the spacing scale for vertical rhythm, the elevation scale for row hover states, and the alignment system for column layout.',
      rules: [
        'Always provide a header row with column labels.',
        'Make sorting and filtering accessible.',
        'Ensure keyboard navigation works for all interactive elements.',
        'Adapt layout for mobile and desktop.',
      ],
      visuals: [
        {
          title: 'Table anatomy',
          caption: 'A well-structured table includes a header, data rows, and an empty state.',
          svg: table_anatomy,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'sorting-filtering',
      title: 'Sorting and filtering',
      intro: 'Help users find what they need.',
      body: 'Sorting reorders data by a column, while filtering narrows the dataset. Both should be accessible and provide clear visual feedback. Use server-side sorting for large datasets and client-side for smaller sets.\n\nProvide clear affordances for column headers to sort, and use dropdowns or type-ahead for filtering.',
      examples: [
        'Sort by name: ascending or descending',
        'Filter by status: active, pending, completed',
        'Search across multiple columns',
      ],
      rules: [
        'Provide sorting on column headers.',
        'Use accessible filtering controls.',
        'Maintain sort/filter state in the URL for shareability.',
        'Debounce client-side filtering for performance.',
      ],
      visuals: [
        {
          title: 'Sort and filter',
          caption: 'Interface elements for sorting and filtering data tables.',
          svg: sort_filter,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'selection',
      title: 'Selection',
      intro: 'Users should be able to select one or more rows.',
      body: 'Row selection enables bulk actions like delete, export, or move to another status. Provide clear checkboxes and indicate the number of selected items. Support single selection for detail views and multi-select for batch operations.\n\nAlways show a count of selected items in the UI chrome.',
      examples: [
        'Single select: navigate with arrows, enter to detail view',
        'Multi-select: checkboxes with shift/ctrl click',
        'Deselect: click again or escape to close',
      ],
      rules: [
        'Provide checkboxes for row selection.',
        'Show a count of selected items.',
        'Support both single and multi-select patterns.',
        'Disable selection during loading states.',
      ],
      visuals: [
        {
          title: 'Selection patterns',
          caption: 'Row selection with checkboxes and bulk action indicators.',
          svg: selection,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'pagination',
      title: 'Pagination',
      intro: 'Navigate through large datasets.',
      body: 'Pagination divides data into discrete pages. Provide numeric page links, previous/next buttons, and information about total items. Consider infinite scroll as an alternative for continuous content, but provide pagination for controlled navigation.\n\nAlways show the range of items on the current page (e.g., "Showing 1-10 of 50").',
      examples: [
        'Page numbers: 1 2 3 4 5',
        'Previous/next buttons',
        'Info text: "Showing 1-10 of 50 items"',
      ],
      rules: [
        'Show the range of items on the current page.',
        'Provide previous and next navigation.',
        'Consider infinite scroll as an alternative.',
        'Update URL parameters for shareability.',
      ],
      visuals: [
        {
          title: 'Pagination',
          caption: 'Page navigation controls with item count information.',
          svg: pagination,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'empty-state',
      title: 'Empty state',
      intro: 'Design for when there is no data.',
      body: 'Every data display should have an empty state that explains why there is no data and provides a path forward. Use illustrative graphics, microcopy, and a call-to-action.\n\nEmpty states should be informative, not dismissive. Tell the user what happened and what they can do next.',
      examples: [
        'No results found: "No items match your filter."',
        'New user: "Get started by adding your first item."',
        'Permission denied: "You do not have access to view items."',
      ],
      rules: [
        'Always provide an empty state when no data is available.',
        'Use clear microcopy that explains the situation.',
        'Provide a call-to-action or next step.',
        'Use the illustration scale for visual interest.',
      ],
      visuals: [
        {
          title: 'Empty state',
          caption: 'Empty state with message and illustration for data display.',
          svg: empty_state,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'responsive',
      title: 'Responsive data display',
      intro: 'Tables and lists that work at every screen size.',
      body: "Tables don't shrink gracefully. Use responsive patterns: horizontal scrolling on mobile, column collapsing, or conversion to a list view. Provide a dense mode for power users and a comfortable mode for casual reading.\n\nUse the spacing scale for horizontal gutters and the elevation scale for row hover states.",
      examples: [
        'Mobile: horizontal scroll, stacked list view',
        'Tablet: column collapse, moderate density',
        'Desktop: full table with sorting and selection',
      ],
      rules: [
        'Provide a mobile-friendly fallback.',
        'Use horizontal scrolling on screens narrower than 640px.',
        'Offer a dense mode with tighter spacing.',
        'Maintain accessibility in all layouts.',
      ],
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying the data display system.',
      body: 'Start with the default layout and density, then adjust for responsive and power-user needs. Use the spacing scale for vertical and horizontal rhythm, and the elevation scale for hover states. Test with keyboard navigation and screen readers.',
      rules: [
        'Use the spacing scale for vertical rhythm.',
        'Apply elevation on hover states.',
        'Test with keyboard navigation and screen readers.',
        'Provide dense and comfortable density options.',
        'Maintain column alignment across breakpoints.',
      ],
      code: {
        label: 'table-example.tsx',
        source: tableExampleTsx,
      },
      items: [
        {
          title: 'Do',
          body: 'Use header rows, provide sorting/filtering.',
        },
        {
          title: "Don't",
          body: "Don't hide horizontal scroll on mobile. Don't forget keyboard accessibility.",
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping your data display.',
      items: [
        {
          title: 'Structure',
          body: 'Header row present. Clear column labels. Sorted and filtered state is persistent.',
        },
        {
          title: 'Accessibility',
          body: 'Keyboard navigable. Screen reader labeled. Sort/filter controls are perceivable.',
        },
        {
          title: 'Responsive',
          body: 'Works across phone, tablet, desktop. Mobile has horizontal scroll or stacked view.',
        },
        {
          title: 'Density',
          body: 'Comfortable mode default. Dense mode available for power users.',
        },
      ],
    },
  ],
};
