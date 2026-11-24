import type { FC, ReactNode } from 'react';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6;
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GridProps {
  cols?: GridCols;
  smCols?: GridCols;
  lgCols?: GridCols;
  gap?: GridGap;
  className?: string;
  children: ReactNode;
}

const colsClass: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const gapClass: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const Grid: FC<GridProps> = ({
  cols = 1,
  smCols,
  lgCols,
  gap = 'md',
  className = '',
  children,
}) => (
  <div
    className={`grid ${colsClass[cols]} ${
      smCols ? `sm:${colsClass[smCols]}` : ''
    } ${lgCols ? `lg:${colsClass[lgCols]}` : ''} ${gapClass[gap]} ${className}`}>
    {children}
  </div>
);

Grid.displayName = 'Grid';
