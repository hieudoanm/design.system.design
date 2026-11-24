import type { FC, ReactNode } from 'react';

interface Hover3DProps {
  children: ReactNode;
  className?: string;
}

export const Hover3D: FC<Hover3DProps> = ({ children, className = '' }) => (
  <div className={`hover-3d ${className}`}>{children}</div>
);

Hover3D.displayName = 'Hover3D';
