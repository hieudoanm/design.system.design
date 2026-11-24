import type { FC, ReactNode } from 'react';

interface StackProps {
  items: ReactNode[];
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const Stack: FC<StackProps> = ({
  items,
  direction = 'vertical',
  className = '',
}) => (
  <div
    className={`stack ${direction === 'horizontal' ? 'stack-horizontal' : ''} ${className}`}>
    {items.map((item, index) => (
      <div
        key={index}
        className="card bg-base-200 border-base-content/10 w-40 border p-4">
        {item}
      </div>
    ))}
  </div>
);
