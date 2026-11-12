import type { Topic } from '../../index';

const virtualizationMd = `Virtualization

Rendering 10,000 rows kills the main thread. Virtualization renders only the visible viewport (+ a small buffer) and recycles DOM nodes as the user scrolls.

\`\`\`tsx
import { FixedSizeList as List } from 'react-window';

function VirtualTable({ rows }: { rows: Row[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <DataRow data={rows[index]} />
    </div>
  );
  return (
    <List
      height={600}
      itemCount={rows.length}
      itemSize={48}
      width="100%"
    >
      {Row}
    </List>
  );
}
\`\`\`

**Rule**: virtualize any list/table with >100 rows. Use \`react-window\` or \`@tanstack/react-virtual\`.`;

const columnResizingMd = `Column resizing

Users need to adjust column widths to read truncated data. Implement with a resize handle on each column header that updates a width map in state.

\`\`\`tsx
function ResizableHeader({ column, onResize }: { column: Column; onResize: (id: string, width: number) => void }) {
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; // only the handle
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = column.width;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    const delta = e.clientX - startX.current;
    onResize(column.id, Math.max(80, startWidth.current + delta));
  };

  const onMouseUp = () => {
    setResizing(false);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <th style={{ width: column.width }}>
      <span>{column.header}</span>
      <div className="resize-handle" onMouseDown={onMouseDown} />
    </th>
  );
}
\`\`\`

Persist column widths in localStorage or URL params.`;

const inlineEditingMd = `Inline editing

Click a cell → it becomes an input → blur/Enter saves, Escape cancels. Show a save indicator while the mutation is in flight.

\`\`\`tsx
function EditableCell({ value, onSave, editing, setEditing }: EditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const onBlur = () => {
    if (localValue !== value) onSave(localValue);
    setEditing(false);
  };

  if (!editing) return <td onDoubleClick={() => setEditing(true)}>{value}</td>;

  return (
    <td>
      <input
        ref={inputRef}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={e => {
          if (e.key === 'Enter') onBlur();
          if (e.key === 'Escape') { setLocalValue(value); setEditing(false); }
        }}
      />
    </td>
  );
}
\`\`\``;

const stickyRowsMd = `Sticky headers & first column

Long tables need sticky headers (scroll Y) and often a sticky first column (scroll X). Use \`position: sticky\` with \`z-index\` layering.

\`\`\`css
.table-header th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface);
}
.table-body td:first-child {
  position: sticky;
  left: 0;
  z-index: 5;
  background: var(--color-paper);
}
\`\`\`

**Rule**: header z-index > first-column z-index > body cells.`;

const densityMd = `Density modes

Power users want dense tables (more rows visible); casual users want comfortable spacing. Offer a density toggle that changes row padding and font size.

| Density | Row height | Cell padding | Font size |
|---------|------------|--------------|-----------|
| Comfortable | 48px | 12px | 14px |
| Compact | 36px | 8px | 13px |

\`\`\`tsx
function Table({ density = 'comfortable' }: TableProps) {
  const rowHeight = density === 'compact' ? 36 : 48;
  const padding = density === 'compact' ? 'var(--space-2)' : 'var(--space-3)';
  return (
    <table style={{ '--row-height': rowHeight + 'px', '--cell-padding': padding }}>
      ...
    </table>
  );
}
\`\`\``;

const a11yGridMd = `Data grid accessibility

A data grid is a composite widget — it needs full keyboard support and ARIA roles.

\`\`\`tsx
<div role="grid" aria-label="User accounts">
  <div role="rowgroup">
    <div role="row">
      {columns.map(col => (
        <div role="columnheader" aria-sort={col.sort} tabIndex={-1}>
          {col.header}
        </div>
      ))}
    </div>
  </div>
  <div role="rowgroup">
    {rows.map(row => (
      <div role="row" aria-rowindex={row.index}>
        {columns.map(col => (
          <div role="gridcell" tabIndex={-1}>{row[col.id]}</div>
        ))}
      </div>
    ))}
  </div>
</div>
\`\`\`

**Keyboard**: Arrow keys navigate cells; Enter/F2 edits; Escape cancels; Home/End jumps to first/last; Ctrl+Home/End jumps to first/last row.
**Screen reader**: announces row/column headers, sort state, selection count.`;

export const dataGrids: Topic = {
  slug: 'data-grids',
  title: 'Data grids & tables',
  tagline: 'Virtualization, resizing, editing, sticky, density — the hard parts of tables.',
  summary:
    'A `table` element is easy. A production data grid — virtualized, resizable, editable, sticky, dense, accessible — is one of the hardest components in the system. This chapter covers the patterns that separate a hobby table from a product-grade data grid, with working code for each.',
  group: 'specialized',
  sections: [
    {
      id: 'virtualization',
      title: 'Virtualization',
      intro: 'Render only what the user sees.',
      body: 'Rendering thousands of DOM nodes blocks the main thread and kills scroll performance. Virtualization renders a fixed-height viewport window (e.g., 20 rows) and recycles nodes as the user scrolls. The rest of the data stays in memory — only the visible slice hits the DOM.',
      rules: [
        'Virtualize any table/list with >100 rows.',
        'Use react-window or @tanstack/react-virtual.',
        'Keep row heights fixed for simple virtualization; use variable-size for dynamic heights.',
        'Overscan by 5–10 rows to hide scroll flashes.',
      ],
      code: {
        label: 'patterns/virtual-table.tsx',
        source: virtualizationMd,
      },
    },
    {
      id: 'column-resizing',
      title: 'Column resizing',
      intro: 'Users decide column widths, not designers.',
      body: 'Fixed column widths force horizontal scroll or truncation. A resize handle on each header lets users allocate space to the data they care about. Persist widths to localStorage or URL params so the layout survives reloads.',
      rules: [
        'Draggable handle on the right edge of each header.',
        'Minimum column width (e.g., 80px) to prevent collapse.',
        'Double-click handle → auto-fit to content.',
        'Persist widths in localStorage or URL.',
      ],
      code: {
        label: 'patterns/column-resizing.tsx',
        source: columnResizingMd,
      },
    },
    {
      id: 'inline-editing',
      title: 'Inline editing',
      intro: 'Click to edit, blur to save, Escape to cancel.',
      body: 'Inline editing keeps the user in context — no modal, no page navigation. Double-click a cell (or press Enter/F2) to enter edit mode; the cell becomes an input with the current value. Blur or Enter saves; Escape reverts. Show a pending indicator while the mutation is in flight.',
      rules: [
        'Enter/F2 to start editing; Enter to save; Escape to cancel.',
        'Blur saves by default (configurable).',
        'Show pending/saving state during async mutation.',
        'Validate on blur; show inline error without leaving edit mode.',
      ],
      code: {
        label: 'patterns/inline-editing.tsx',
        source: inlineEditingMd,
      },
    },
    {
      id: 'sticky',
      title: 'Sticky headers & first column',
      intro: 'Context that follows the scroll.',
      body: 'When a table is taller than the viewport, the header disappears on scroll — users lose column context. Sticky headers (position: sticky; top: 0) keep column labels visible. For wide tables with horizontal scroll, a sticky first column (position: sticky; left: 0) keeps the row identifier (name, ID) visible.',
      rules: [
        'Header: position: sticky; top: 0; z-index: 10.',
        'First column: position: sticky; left: 0; z-index: 5.',
        'Header z-index > first-column z-index > body cells.',
        'Background on sticky elements to prevent bleed-through.',
      ],
      code: {
        label: 'patterns/sticky.css',
        source: stickyRowsMd,
      },
    },
    {
      id: 'density',
      title: 'Density modes',
      intro: 'Comfortable for reading, compact for power users.',
      body: 'Not all users want the same density. Casual users prefer comfortable spacing (more whitespace, easier scanning); power users want compact density (more rows per screen, faster scanning). Provide a density toggle that adjusts row height, cell padding, and font size simultaneously.',
      rules: [
        'Two modes: comfortable (default) and compact.',
        'Comfortable: 48px row height, space-3 padding, 14px text.',
        'Compact: 36px row height, space-2 padding, 13px text.',
        'Persist preference in localStorage.',
      ],
      code: {
        label: 'patterns/density.tsx',
        source: densityMd,
      },
    },
    {
      id: 'accessibility',
      title: 'Data grid accessibility',
      intro: 'A grid is a composite widget — it needs full keyboard + ARIA.',
      body: 'A data grid is not a <table> — it is a composite widget with row/column navigation, editing, and selection. It needs `role="grid"`, `role="row"`, `role="columnheader"`, `role="gridcell"`, and full keyboard support (Arrow keys, Home/End, Enter/F2, Escape). Screen readers must hear row/column headers, sort state, and selection count.',
      rules: [
        'Container: role="grid" + aria-label.',
        'Headers: role="columnheader" + aria-sort.',
        'Cells: role="gridcell" + tabIndex=-1 (roving tabindex).',
        'Arrow keys navigate; Home/End jump; Enter/F2 edits; Escape cancels.',
        'Announce sort changes, selection count, and row/column position.',
      ],
      code: {
        label: 'patterns/a11y-grid.tsx',
        source: a11yGridMd,
      },
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping a data grid.',
      items: [
        {
          title: 'Virtualization',
          body: '>100 rows virtualized. Overscan configured. Smooth 60fps scroll.',
        },
        {
          title: 'Column resizing',
          body: 'Draggable handles. Min width enforced. Widths persisted.',
        },
        {
          title: 'Inline editing',
          body: 'Enter/F2/click to edit. Blur/Enter saves. Escape cancels. Pending state shown.',
        },
        {
          title: 'Sticky',
          body: 'Header sticks on vertical scroll. First column sticks on horizontal scroll. No bleed.',
        },
        {
          title: 'Density',
          body: 'Comfortable default. Compact option. Preference persisted.',
        },
        {
          title: 'Accessibility',
          body: 'Full grid ARIA. Roving tabindex. Arrow navigation. Sort/selection announced.',
        },
      ],
    },
  ],
};
