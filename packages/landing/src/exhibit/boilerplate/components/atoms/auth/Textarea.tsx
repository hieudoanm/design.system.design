import type { FC, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea: FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={textareaId} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`textarea textarea-bordered w-full ${error ? 'textarea-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-error text-xs">{error}</span>}
    </div>
  );
};
