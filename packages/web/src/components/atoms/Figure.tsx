import type { TopicTable } from '@/content/ts/design-system';
import type { FC } from 'react';

const DataTable: FC<{ table: TopicTable }> = ({ table }) => {
  const { columns, rows } = table;

  const element = (
    <div className='mt-3 overflow-x-auto'>
      <table className='w-full border-collapse text-left text-sm'>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className='border-ink/15 border-b py-2 pr-6 font-mono text-xs tracking-[0.15em] whitespace-nowrap uppercase'>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className='border-ink/10 border-b py-2 pr-6 align-top whitespace-nowrap'>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!table.summary) return element;

  return (
    <details className='mt-4'>
      <summary className='text-mute cursor-pointer text-sm font-medium'>{table.summary}</summary>
      {element}
    </details>
  );
};

/**
 * A drawn example: a title, a caption, an inline SVG and the data behind it.
 * The SVG markup comes from the content files, which are part of this repo.
 */
const Figure: FC<{
  title: string;
  caption?: string;
  svg?: string;
  table?: TopicTable;
  minWidth?: number;
  maxWidth?: number;
}> = ({ title, caption, svg, table, minWidth, maxWidth }) => {
  return (
    <figure className='border-ink/15 rounded-lg border p-5'>
      <figcaption className='mb-4'>
        <span className='text-marker font-mono text-xs tracking-[0.2em] uppercase'>{title}</span>
        {caption && <p className='text-mute mt-2 text-sm leading-relaxed'>{caption}</p>}
      </figcaption>

      {svg && (
        <div className='overflow-x-auto'>
          <div
            className='text-ink mx-auto'
            style={{ minWidth, maxWidth }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      )}

      {table && <DataTable table={table} />}
    </figure>
  );
};

export default Figure;
