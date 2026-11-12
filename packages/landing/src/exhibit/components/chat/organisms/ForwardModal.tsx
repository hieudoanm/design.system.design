'use client';

import { type FC, useState, useMemo } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import { SearchBar } from '@/exhibit/components/chat/molecules/SearchBar';

interface ForwardModalProps {
  messageId: string;
  onClose: () => void;
}

export const ForwardModal: FC<ForwardModalProps> = ({ messageId, onClose }) => {
  const { chats, forwardToMultiple } = useData();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return chats.filter((c) =>
      term === '' ? true : c.title.toLowerCase().includes(term)
    );
  }, [chats, query]);

  const toggle = (chatId: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  };

  const handleForward = async (): Promise<void> => {
    if (selected.size === 0) return;
    await forwardToMultiple(messageId, Array.from(selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
      <div className="bg-base-100 border-base-300 flex w-full max-w-sm flex-col rounded-2xl border shadow-xl">
        <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
          <h2 className="flex-1 font-semibold">Forward to</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-xs btn-ghost">
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        <div className="px-3 py-2">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search chats…"
          />
        </div>
        <div className="max-h-64 flex-1 overflow-y-auto">
          {filtered.map((chat) => {
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => toggle(chat.id)}
                className="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-2 text-left transition-colors">
                <Avatar
                  name={chat.title}
                  color={chat.avatarColor}
                  kind={chat.kind === 'group' ? 'group' : 'user'}
                />
                <span className="flex-1 truncate text-sm">{chat.title}</span>
                {selected.has(chat.id) && (
                  <FaCheck className="text-primary h-4 w-4" />
                )}
              </button>
            );
          })}
        </div>
        <div className="border-base-300 flex justify-end gap-2 border-t px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleForward()}
            disabled={selected.size === 0}
            className="btn btn-primary btn-sm">
            Forward ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
};
