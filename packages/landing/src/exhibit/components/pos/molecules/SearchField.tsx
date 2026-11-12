import { type FC } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const SearchField: FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder,
}) => (
  <div className="relative">
    <FiSearch className="text-base-content/30 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
    <input
      type="text"
      placeholder={placeholder}
      className="input input-bordered input-sm w-full pr-8 pl-9"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        className="absolute top-1/2 right-3 -translate-y-1/2"
        onClick={() => onChange('')}>
        <FiX className="size-4" />
      </button>
    )}
  </div>
);
