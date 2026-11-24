import type { FC } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  done?: boolean;
}

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  className?: string;
}

export const Checklist: FC<ChecklistProps> = ({
  items,
  onToggle,
  className = '',
}) => (
  <ul className={`flex w-full flex-col gap-1 ${className}`}>
    {items.map((item) => (
      <li key={item.id}>
        <label className="flex cursor-pointer items-center gap-2 px-1 py-1 text-sm">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => onToggle(item.id)}
            className="checkbox checkbox-sm"
          />
          <span
            className={`transition-colors ${
              item.done ? 'text-base-content/50 line-through' : ''
            }`}>
            {item.label}
          </span>
        </label>
      </li>
    ))}
  </ul>
);

Checklist.displayName = 'Checklist';
