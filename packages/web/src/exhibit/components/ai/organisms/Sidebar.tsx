'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiPlus,
  FiSearch,
  FiMessageSquare,
  FiArchive,
  FiFolder,
  FiDownload,
  FiX,
} from 'react-icons/fi';
import { useData } from '@/exhibit/providers/ai/DataProvider';
import { ConversationCard } from '@/exhibit/components/ai/molecules/ConversationCard';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { conversations, createConversation, folders, createFolder } =
    useData();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase());
    const matchesArchive = showArchived ? c.archived : !c.archived;
    return matchesSearch && matchesArchive;
  });

  const pinned = filteredConversations.filter((c) => c.pinned);
  const unpinned = filteredConversations.filter((c) => !c.pinned);

  const handleNewChat = async () => {
    const conv = await createConversation();
    router.push(`/design-system/exhibits/ai`);
    onClose();
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`bg-base-200 fixed inset-y-0 left-0 z-40 flex w-72 flex-col transition-transform lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="border-base-300 flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold">Chats</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle lg:hidden">
            <FiX className="size-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={handleNewChat}
            className="btn btn-primary w-full">
            <FiPlus className="size-4" />
            New Chat
          </button>
        </div>

        <div className="px-4 pb-2">
          <div className="input input-sm flex items-center gap-2">
            <FiSearch className="size-4 opacity-50" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={`btn btn-xs ${
                !showArchived ? 'btn-primary' : 'btn-ghost'
              }`}>
              <FiMessageSquare className="size-3" />
              Active
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={`btn btn-xs ${
                showArchived ? 'btn-primary' : 'btn-ghost'
              }`}>
              <FiArchive className="size-3" />
              Archived
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {pinned.length > 0 && (
            <div className="mb-2">
              <h3 className="text-base-content/50 px-2 py-1 text-xs font-semibold uppercase">
                Pinned
              </h3>
              {pinned.map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </div>
          )}

          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <h3 className="text-base-content/50 px-2 py-1 text-xs font-semibold uppercase">
                  Recent
                </h3>
              )}
              {unpinned.map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </div>
          )}

          {filteredConversations.length === 0 && (
            <div className="text-base-content/50 py-8 text-center text-sm">
              No conversations found
            </div>
          )}
        </div>

        <div className="border-base-300 border-t p-4">
          <div className="mb-2 flex items-center gap-2">
            <FiFolder className="size-4" />
            <span className="text-xs font-semibold">Folders</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New folder..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="input input-sm flex-1"
            />
            <button
              type="button"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="btn btn-sm btn-primary">
              Add
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between rounded px-2 py-1 text-sm">
                <span>{folder.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-base-300 border-t p-3">
          <Link
            href="/design-system/exhibits"
            className="btn btn-ghost btn-sm w-full justify-start gap-1.5">
            <FiDownload className="size-4" />
            Downloads
          </Link>
        </div>
      </aside>
    </>
  );
};
