import type { FC, MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ContextMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

interface ContextMenuProps {
  trigger: ReactNode;
  items: ContextMenuItem[];
}

export const ContextMenu: FC<ContextMenuProps> = ({ trigger, items }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, close]);

  const handleOpen = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  return (
    <div ref={ref} onContextMenu={handleOpen} className="inline-block">
      {trigger}
      {open && (
        <ul
          role="menu"
          aria-label="Context menu"
          className="border-base-content/10 bg-base-100 fixed z-50 w-48 rounded-xl border p-1 shadow-xl"
          style={{ left: position.x, top: position.y }}>
          {items.map((item, index) => (
            <li key={index} role="none">
              <button
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  close();
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  item.danger
                    ? 'text-error hover:bg-error/10'
                    : 'hover:bg-base-200'
                }`}>
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
