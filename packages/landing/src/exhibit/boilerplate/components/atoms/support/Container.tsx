import type { FC, ReactNode } from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

interface ContainerProps {
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
}

const sizeClass: Record<ContainerSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  full: 'max-w-full',
};

export const Container: FC<ContainerProps> = ({
  size = 'xl',
  className = '',
  children,
}) => (
  <div className={`mx-auto w-full px-4 ${sizeClass[size]} ${className}`}>
    {children}
  </div>
);

Container.displayName = 'Container';
