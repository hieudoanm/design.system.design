import type { FC, LabelHTMLAttributes, ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export const Label: FC<LabelProps> = ({
  children,
  className = '',
  ...props
}) => (
  <label className={`text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);
