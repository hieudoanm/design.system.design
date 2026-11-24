import type { FC } from 'react';

interface FeatureIconProps {
  label: string;
  icon: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass: Record<NonNullable<FeatureIconProps['size']>, string> = {
  sm: 'h-10 w-10 text-lg',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-16 w-16 text-3xl',
};

export const FeatureIcon: FC<FeatureIconProps> = ({
  label,
  icon,
  size = 'md',
}) => (
  <div
    data-testid="feature-icon"
    role="img"
    aria-label={label}
    className={`bg-primary/10 text-primary flex items-center justify-center rounded-xl ${sizeClass[size]}`}>
    {icon}
  </div>
);
