import { type FC } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search…',
}) => (
  <label className="input input-bordered flex items-center gap-2">
    <FaSearch aria-hidden="true" className="text-base-content/40 h-4 w-4" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full grow"
    />
  </label>
);
