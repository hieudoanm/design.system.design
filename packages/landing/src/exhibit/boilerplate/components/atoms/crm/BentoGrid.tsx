import type { FC, ReactNode } from 'react';

interface BentoCell {
  key: string;
  content: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
}

interface BentoGridProps {
  cells: BentoCell[];
  className?: string;
}

const colSpanClass: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
};

const rowSpanClass: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};

export const BentoGrid: FC<BentoGridProps> = ({ cells, className = '' }) => (
  <div className={`grid grid-cols-4 gap-4 ${className}`}>
    {cells.map((cell) => (
      <div
        key={cell.key}
        className={`${colSpanClass[cell.colSpan ?? 1]} ${
          rowSpanClass[cell.rowSpan ?? 1]
        }`}>
        {cell.content}
      </div>
    ))}
  </div>
);

BentoGrid.displayName = 'BentoGrid';
