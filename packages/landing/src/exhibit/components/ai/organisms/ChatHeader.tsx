'use client';

import { type FC, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiDownload,
} from 'react-icons/fi';
import type { Conversation } from '@/exhibit/types/ai';
import { useData } from '@/exhibit/providers/ai/DataProvider';
import { useToast } from '@/exhibit/providers/ai/ToastProvider';
import { exportAsMarkdown, exportAsJSON } from '@/exhibit/utils/ai/format';

interface ChatHeaderProps {
  conversation: Conversation;
}

export const ChatHeader: FC<ChatHeaderProps> = ({ conversation }) => {
  const router = useRouter();
  const { renameConversation, deleteConversation, currentMessages } = useData();
  const { addToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenameSubmit = async () => {
    if (editTitle.trim()) {
      await renameConversation(conversation.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteConversation(conversation.id);
    addToast('Conversation deleted', 'info');
    router.push('/design-system/exhibits/ai');
  };

  const handleExportMarkdown = () => {
    const md = exportAsMarkdown(conversation.title, currentMessages);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Exported as Markdown', 'success');
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    const json = exportAsJSON(conversation, currentMessages);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Exported as JSON', 'success');
    setShowMenu(false);
  };

  return (
    <header className="bg-base-100 border-base-300 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3">
      <button
        type="button"
        onClick={() => router.push('/design-system/exhibits/ai')}
        className="btn btn-neutral btn-sm btn-circle">
        <FiArrowLeft className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="input input-sm w-full"
          />
        ) : (
          <h1
            className="truncate text-lg font-semibold"
            onDoubleClick={() => {
              setEditTitle(conversation.title);
              setIsEditing(true);
            }}>
            {conversation.title}
          </h1>
        )}
        <span className="badge badge-sm">{conversation.model}</span>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="btn btn-ghost btn-circle">
          <FiMoreVertical className="size-5" />
        </button>
        {showMenu && (
          <ul className="dropdown-content menu bg-base-100 rounded-box z-20 w-52 shadow-sm">
            <li>
              <button
                type="button"
                onClick={() => {
                  setEditTitle(conversation.title);
                  setIsEditing(true);
                  setShowMenu(false);
                }}>
                <FiEdit2 className="size-4" />
                Rename
              </button>
            </li>
            <li>
              <button type="button" onClick={handleExportMarkdown}>
                <FiDownload className="size-4" />
                Export Markdown
              </button>
            </li>
            <li>
              <button type="button" onClick={handleExportJSON}>
                <FiDownload className="size-4" />
                Export JSON
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleDelete}
                className="text-error">
                <FiTrash2 className="size-4" />
                Delete
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
};
