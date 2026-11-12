'use client';

import { type FC, useEffect, useRef } from 'react';
import {
  FaCopy,
  FaReply,
  FaShare,
  FaPencilAlt,
  FaTrash,
  FaTrashAlt,
} from 'react-icons/fa';

interface MessageContextMenuProps {
  x: number;
  y: number;
  isMine: boolean;
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteForEveryone?: () => void;
}

export const MessageContextMenu: FC<MessageContextMenuProps> = ({
  x,
  y,
  isMine,
  onClose,
  onReply,
  onCopy,
  onForward,
  onEdit,
  onDelete,
  onDeleteForEveryone,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const items = [
    { icon: FaReply, label: 'Reply', onClick: onReply },
    { icon: FaCopy, label: 'Copy', onClick: onCopy },
    { icon: FaShare, label: 'Forward', onClick: onForward },
    ...(isMine
      ? [
          { icon: FaPencilAlt, label: 'Edit', onClick: onEdit },
          { icon: FaTrash, label: 'Delete', onClick: onDelete, danger: true },
          ...(onDeleteForEveryone
            ? [
                {
                  icon: FaTrashAlt,
                  label: 'Delete for Everyone',
                  onClick: onDeleteForEveryone,
                  danger: true,
                },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <div
      ref={menuRef}
      style={{ left: x, top: y }}
      className="bg-base-100 border-base-300 fixed z-50 min-w-[160px] rounded-xl border p-1 shadow-xl">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            'danger' in item && item.danger
              ? 'text-error hover:bg-error/10'
              : 'hover:bg-base-200'
          }`}>
          <item.icon aria-hidden="true" className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  );
};
