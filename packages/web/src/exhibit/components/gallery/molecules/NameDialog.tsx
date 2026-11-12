'use client';

import { type FC, useState } from 'react';

interface NameDialogProps {
  title: string;
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export const NameDialog: FC<NameDialogProps> = ({
  title,
  placeholder,
  submitLabel,
  initialValue = '',
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue);
  const submit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
  };
  return (
    <div className="bg-neutral/40 absolute inset-0 z-40 flex items-center justify-center p-6">
      <div className="bg-base-100 card w-full shadow-xl">
        <div className="card-body gap-3 p-5">
          <h2 className="text-sm font-semibold">{title}</h2>
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            aria-label={placeholder}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            className="input input-bordered input-sm w-full"
          />
          <div className="card-actions justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={!value.trim()}
              onClick={submit}
              className="btn btn-primary btn-sm">
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
