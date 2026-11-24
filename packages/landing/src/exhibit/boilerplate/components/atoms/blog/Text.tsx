import { createElement } from 'react';
import type { FC, ReactNode } from 'react';

type TextTag =
  | 'p'
  | 'span'
  | 'div'
  | 'small'
  | 'strong'
  | 'em'
  | 'label'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4';
type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextColor = 'default' | 'muted' | 'primary' | 'error' | 'success';

interface TextProps {
  as?: TextTag;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  className?: string;
  children: ReactNode;
}

const sizeClass: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const weightClass: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorClass: Record<TextColor, string> = {
  default: 'text-base-content',
  muted: 'text-base-content/60',
  primary: 'text-primary',
  error: 'text-error',
  success: 'text-success',
};

export const Text: FC<TextProps> = ({
  as = 'p',
  size = 'md',
  weight = 'normal',
  color = 'default',
  className = '',
  children,
}) =>
  createElement(
    as,
    {
      className: `${sizeClass[size]} ${weightClass[weight]} ${colorClass[color]} ${className}`,
    },
    children
  );
