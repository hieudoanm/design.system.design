import type { FC, ReactNode } from 'react';

interface FolderItemProps {
  label: string;
  count?: number;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const FolderItem: FC<FolderItemProps> = ({
  label,
  count,
  icon,
  active = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid="folder-item"
    aria-current={active ? 'page' : undefined}
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      active ? 'bg-primary text-primary-content' : 'hover:bg-base-200'
    }`}>
    {icon && <span className="text-base-content/60">{icon}</span>}
    <span className="flex-1 text-left">{label}</span>
    {count !== undefined && (
      <span
        className={`badge badge-sm ${
          active ? 'badge-ghost text-primary-content' : 'badge-neutral'
        }`}>
        {count}
      </span>
    )}
  </button>
);

FolderItem.displayName = 'FolderItem';
