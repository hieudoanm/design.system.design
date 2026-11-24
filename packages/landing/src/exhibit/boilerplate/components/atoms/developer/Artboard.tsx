import type { FC, ReactNode } from 'react';

type ArtboardSize =
  'phone-1' | 'phone-2' | 'phone-3' | 'phone-4' | 'phone-5' | 'phone-6';

interface ArtboardProps {
  title?: string;
  size?: ArtboardSize;
  className?: string;
  children?: ReactNode;
}

export const Artboard: FC<ArtboardProps> = ({
  title,
  size = 'phone-1',
  className = '',
  children,
}) => (
  <div
    role="group"
    aria-label={title ?? 'Artboard'}
    className={`artboard artboard-demo ${size} ${className}`}>
    {children}
  </div>
);
