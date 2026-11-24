import type { FC, ReactNode } from 'react';

interface FieldsetProps {
  legend: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export const Fieldset: FC<FieldsetProps> = ({
  legend,
  description,
  disabled = false,
  className = '',
  children,
}) => (
  <fieldset
    disabled={disabled}
    className={`border-base-content/20 ${className}`}>
    <legend>{legend}</legend>
    {description && (
      <p className="text-base-content/50 mb-3 text-sm">{description}</p>
    )}
    <div className="flex flex-col gap-3">{children}</div>
  </fieldset>
);
