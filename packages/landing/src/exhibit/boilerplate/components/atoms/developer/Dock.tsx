import type { FC, ReactNode } from 'react';

interface DockItem {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface DockProps {
  items: DockItem[];
  label?: string;
  className?: string;
}

export const Dock: FC<DockProps> = ({
  items,
  label = 'Dock',
  className = '',
}) => (
  <nav
    aria-label={label}
    className={`flex flex-col items-center gap-2 ${className}`}>
    <div className="bg-base-200 border-base-content/15 flex items-end gap-2 rounded-2xl border p-2 shadow-xl">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-label={item.label}
          aria-pressed={Boolean(item.active)}
          title={item.label}
          onClick={item.onClick}
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-all duration-150 hover:-translate-y-2 hover:scale-110 ${
            item.active
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 hover:bg-base-300'
          }`}>
          {item.icon}
        </button>
      ))}
    </div>
    <span className="text-base-content/50 text-xs">{label}</span>
  </nav>
);
