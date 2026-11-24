import type { FC, ReactNode } from 'react';

interface ScrollAreaProps {
  children?: ReactNode;
  maxHeight?: number | string;
  className?: string;
  innerClassName?: string;
}

export const ScrollArea: FC<ScrollAreaProps> = ({
  children,
  maxHeight = 240,
  className = '',
  innerClassName = '',
}) => (
  <div
    className={`scrollbar-thin overflow-y-auto ${className}`}
    style={{ maxHeight }}>
    <div className={innerClassName}>{children}</div>
  </div>
);
