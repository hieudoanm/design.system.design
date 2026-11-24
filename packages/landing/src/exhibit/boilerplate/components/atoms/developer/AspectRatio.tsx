import type { FC, ReactNode } from 'react';

interface AspectRatioProps {
  ratio?: number;
  className?: string;
  children?: ReactNode;
}

export const AspectRatio: FC<AspectRatioProps> = ({
  ratio = 16 / 9,
  className = '',
  children,
}) => (
  <div
    className={`relative w-full ${className}`}
    style={{ aspectRatio: String(ratio) }}>
    <div className="absolute inset-0 overflow-hidden">{children}</div>
  </div>
);
