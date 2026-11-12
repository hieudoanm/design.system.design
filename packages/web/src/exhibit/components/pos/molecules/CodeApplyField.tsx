import { type FC } from 'react';

interface CodeApplyFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  feedback?: string;
}

export const CodeApplyField: FC<CodeApplyFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onApply,
  feedback,
}) => (
  <div className="mb-4">
    <h2 className="mb-2 text-sm font-semibold">{label}</h2>
    <div className="flex gap-2">
      <input
        type="text"
        className="input input-bordered input-sm flex-1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="btn btn-outline btn-sm" onClick={onApply}>
        Apply
      </button>
    </div>
    {feedback && <p className="text-success mt-1 text-xs">{feedback}</p>}
  </div>
);
