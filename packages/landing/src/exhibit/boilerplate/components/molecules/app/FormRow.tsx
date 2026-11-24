import type { FC, ReactNode } from 'react';

interface FormRowProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormRow: FC<FormRowProps> = ({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && (
      <span className="text-base-content/50 text-xs">{hint}</span>
    )}
    {error && <span className="text-error text-xs">{error}</span>}
  </div>
);
