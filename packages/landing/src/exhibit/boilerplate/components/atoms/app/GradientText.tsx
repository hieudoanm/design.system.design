import type { FC, ReactNode } from 'react';

type ThemeColor =
  'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

type GradientDirection = 'r' | 'l' | 't' | 'b' | 'tr' | 'br';

interface GradientTextProps {
  children: ReactNode;
  from?: ThemeColor;
  to?: ThemeColor;
  via?: ThemeColor;
  direction?: GradientDirection;
  className?: string;
}

const fromClass: Record<ThemeColor, string> = {
  primary: 'from-primary',
  secondary: 'from-secondary',
  accent: 'from-accent',
  success: 'from-success',
  warning: 'from-warning',
  error: 'from-error',
};

const viaClass: Record<ThemeColor, string> = {
  primary: 'via-primary',
  secondary: 'via-secondary',
  accent: 'via-accent',
  success: 'via-success',
  warning: 'via-warning',
  error: 'via-error',
};

const toClass: Record<ThemeColor, string> = {
  primary: 'to-primary',
  secondary: 'to-secondary',
  accent: 'to-accent',
  success: 'to-success',
  warning: 'to-warning',
  error: 'to-error',
};

const directionClass: Record<GradientDirection, string> = {
  r: 'bg-gradient-to-r',
  l: 'bg-gradient-to-l',
  t: 'bg-gradient-to-t',
  b: 'bg-gradient-to-b',
  tr: 'bg-gradient-to-tr',
  br: 'bg-gradient-to-br',
};

export const GradientText: FC<GradientTextProps> = ({
  children,
  from = 'primary',
  to = 'accent',
  via,
  direction = 'r',
  className = '',
}) => (
  <span
    className={`${directionClass[direction]} ${fromClass[from]} ${
      via ? viaClass[via] : ''
    } ${toClass[to]} bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

GradientText.displayName = 'GradientText';
