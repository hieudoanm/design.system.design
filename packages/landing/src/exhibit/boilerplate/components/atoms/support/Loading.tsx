import type { FC } from 'react';

type LoadingVariant =
  'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';
type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
}

const variantClass: Record<LoadingVariant, string> = {
  spinner: 'loading-spinner',
  dots: 'loading-dots',
  ring: 'loading-ring',
  ball: 'loading-ball',
  bars: 'loading-bars',
  infinity: 'loading-infinity',
};

const sizeClass: Record<LoadingSize, string> = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: '',
  lg: 'loading-lg',
  xl: 'loading-xl',
};

export const Loading: FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  className = '',
}) => (
  <span
    className={`loading ${variantClass[variant]} ${sizeClass[size]} ${className}`}
  />
);

Loading.displayName = 'Loading';
