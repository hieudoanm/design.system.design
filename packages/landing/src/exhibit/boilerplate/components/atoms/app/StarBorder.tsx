import type { FC, ReactNode } from 'react';

type ThemeColor =
  'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

interface StarBorderProps {
  children: ReactNode;
  from?: ThemeColor;
  to?: ThemeColor;
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

const toClass: Record<ThemeColor, string> = {
  primary: 'to-primary',
  secondary: 'to-secondary',
  accent: 'to-accent',
  success: 'to-success',
  warning: 'to-warning',
  error: 'to-error',
};

export const StarBorder: FC<StarBorderProps> = ({
  children,
  from = 'primary',
  to = 'accent',
  className = '',
}) => (
  <div
    className={`bg-gradient-to-r ${fromClass[from]} ${toClass[to]} rounded-2xl p-px ${className}`}>
    <div className="bg-base-100 rounded-2xl">{children}</div>
  </div>
);

StarBorder.displayName = 'StarBorder';
