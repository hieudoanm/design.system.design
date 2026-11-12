import { type FC } from 'react';

interface FilterTab {
  key: string;
  label: string;
  activeClass: string;
  className?: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  onSelect: (key: string) => void;
}

export const FilterTabs: FC<FilterTabsProps> = ({ tabs, active, onSelect }) => (
  <div className="border-base-300 flex gap-2 border-b px-4 py-2">
    {tabs.map(({ key, label, activeClass, className = '' }) => (
      <button
        key={key}
        className={`btn btn-xs ${className} ${
          active === key ? activeClass : 'btn-ghost'
        }`.trim()}
        onClick={() => onSelect(key)}>
        {label}
      </button>
    ))}
  </div>
);
