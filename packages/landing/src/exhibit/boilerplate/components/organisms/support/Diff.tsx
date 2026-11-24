import type { FC, ReactNode } from 'react';

interface DiffProps {
  before: ReactNode;
  after: ReactNode;
  aspectClass?: string;
  className?: string;
}

export const Diff: FC<DiffProps> = ({
  before,
  after,
  aspectClass = 'aspect-16/9',
  className = '',
}) => (
  <div className={`diff ${aspectClass} ${className}`}>
    <div className="diff-item-1">{before}</div>
    <div className="diff-item-2">{after}</div>
    <div className="diff-resizer" aria-hidden="true" />
  </div>
);
