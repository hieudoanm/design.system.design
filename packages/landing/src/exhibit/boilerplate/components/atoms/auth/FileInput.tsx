import type { FC } from 'react';

interface FileInputProps {
  label: string;
  onChange?: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}

export const FileInput: FC<FileInputProps> = ({
  label,
  onChange,
  accept,
  multiple = false,
  hint,
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">{label}</label>
    <input
      type="file"
      aria-label={label}
      className="file-input file-input-bordered w-full"
      accept={accept}
      multiple={multiple}
      onChange={(e) => onChange?.(e.target.files)}
    />
    {hint && <span className="text-base-content/50 text-xs">{hint}</span>}
  </div>
);
