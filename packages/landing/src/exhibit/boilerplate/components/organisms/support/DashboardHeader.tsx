import { FiSearch } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export const DashboardHeader: FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
}) => (
  <div className="bg-base-200 border-base-content/10 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-medium">{title}</h2>
      {subtitle && <p className="text-base-content/60 text-sm">{subtitle}</p>}
    </div>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {onSearchChange && (
        <label className="input input-bordered input-sm flex w-full items-center gap-2 sm:w-64">
          <FiSearch className="text-base-content/50" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </label>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </div>
);
