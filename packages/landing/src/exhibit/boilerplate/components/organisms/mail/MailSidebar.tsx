import type { FC } from 'react';

interface MailFolder {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

interface MailSidebarProps {
  folders: MailFolder[];
  activeId?: string;
  onSelect?: (folder: MailFolder) => void;
  onCompose?: () => void;
}

export const MailSidebar: FC<MailSidebarProps> = ({
  folders,
  activeId,
  onSelect,
  onCompose,
}) => (
  <aside
    className="bg-base-200 border-base-content/10 flex w-64 shrink-0 flex-col gap-2 rounded-xl border p-3"
    data-testid="mail-sidebar">
    <button
      type="button"
      onClick={onCompose}
      className="btn btn-primary btn-sm mb-2 w-full">
      Compose
    </button>
    <ul className="flex flex-col gap-1">
      {folders.map((folder) => (
        <li key={folder.id}>
          <button
            type="button"
            onClick={() => onSelect?.(folder)}
            className={`hover:bg-base-300/60 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
              folder.id === activeId ? 'bg-base-300/80 font-medium' : ''
            }`}>
            <span>{folder.icon ?? '📁'}</span>
            <span>{folder.name}</span>
            <span className="badge badge-ghost badge-sm ml-auto">
              {folder.count}
            </span>
          </button>
        </li>
      ))}
    </ul>
  </aside>
);

MailSidebar.displayName = 'MailSidebar';
