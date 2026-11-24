import type { FC } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'loading-sm',
  md: '',
  lg: 'loading-lg',
};

export const Spinner: FC<SpinnerProps> = ({ size = 'md' }) => (
  <span className={`loading loading-spinner ${sizeClass[size]}`} />
);
