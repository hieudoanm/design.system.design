'use client';

import { type FC, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FiMoreVertical,
  FiMapPin,
  FiArchive,
  FiTrash2,
  FiCopy,
} from 'react-icons/fi';
import type { Conversation } from '@/exhibit/types/ai';
import { formatRelativeTime, truncateText } from '@/exhibit/utils/ai/format';
import { useData } from '@/exhibit/providers/ai/DataProvider';
import { useToast } from '@/exhibit/providers/ai/ToastProvider';

interface ConversationCardProps {
  conversation: Conversation;
  preview?: string;
  isActive?: boolean;
}

export const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  preview,
  isActive,
}) => {
  const {
    setCurrentConversation,
    deleteConversation,
    renameConversation,
    togglePin,
    toggleArchive,
    duplicateConversation,
  } = useData();
  const { addToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setEditTitle(conversation.title);
    setIsEditing(true);
  };

  const handleRenameSubmit = async () => {
    if (editTitle.trim()) {
      await renameConversation(conversation.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteConversation(conversation.id);
    addToast('Conversation deleted', 'info');
    setShowMenu(false);
  };

  const handlePin = async () => {
    await togglePin(conversation.id);
    setShowMenu(false);
  };

  const handleArchive = async () => {
    await toggleArchive(conversation.id);
    addToast('Conversation archived', 'info');
    setShowMenu(false);
  };

  const handleDuplicate = async () => {
    await duplicateConversation(conversation.id);
    addToast('Conversation duplicated', 'success');
    setShowMenu(false);
  };

  return (
    <Link
      href={`/design-system/exhibits/chat`}
      onClick={() => setCurrentConversation(conversation)}
      className={`card card-body hover:bg-base-200 p-3 transition-colors ${
        isActive ? 'bg-base-200' : ''
      }`}>
      <div className="flex items-start justify-between">
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
            <h3
              className="truncate text-sm font-medium"
              onDoubleClick={handleDoubleClick}>
              {conversation.pinned && (
                <FiMapPin className="text-warning mr-1 inline size-3" />
              )}
              {conversation.title}
            </h3>
          )}
          {preview && (
            <p className="text-base-content/60 mt-1 truncate text-xs">
              {truncateText(preview, 60)}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <span className="badge badge-outline badge-xs">
              {conversation.model}
            </span>
            <time className="text-base-content/40 text-xs">
              {formatRelativeTime(conversation.updatedAt)}
            </time>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="btn btn-ghost btn-xs btn-circle">
            <FiMoreVertical className="size-4" />
          </button>
          {showMenu && (
            <ul className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 shadow-sm">
              <li>
                <button type="button" onClick={handlePin}>
                  <FiMapPin className="size-4" />
                  {conversation.pinned ? 'Unpin' : 'Pin'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleArchive}>
                  <FiArchive className="size-4" />
                  {conversation.archived ? 'Unarchive' : 'Archive'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleDuplicate}>
                  <FiCopy className="size-4" />
                  Duplicate
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
      </div>
    </Link>
  );
};
