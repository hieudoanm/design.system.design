import type { FC } from 'react';

interface SeparatorProps {
  className?: string;
}

export const Separator: FC<SeparatorProps> = ({ className = '' }) => (
  <hr className={`border-base-content/20 my-4 ${className}`} />
);
