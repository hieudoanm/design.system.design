'use client';

import { type FC, useState } from 'react';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { useToast } from '@/exhibit/providers/chat/ToastProvider';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export const NewChatModal: FC<NewChatModalProps> = ({
  open,
  onClose,
  onChatCreated,
}) => {
  const { contacts, createChat, createGroup } = useData();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!open) return null;

  const toggleMember = (id: string): void => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const startDirect = (contactId: string): void => {
    void createChat(contactId).then((chat) => {
      onChatCreated(chat.id);
      onClose();
      showToast('Chat started', 'success');
    });
  };

  const startGroup = (): void => {
    if (selectedIds.length === 0) {
      showToast('Pick at least one member', 'error');
      return;
    }
    void createGroup(groupTitle, selectedIds).then((chat) => {
      onChatCreated(chat.id);
      onClose();
      setGroupTitle('');
      setSelectedIds([]);
      showToast('Group created', 'success');
    });
  };

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-label="New chat">
      <div className="modal-box">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">New chat</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-circle btn-ghost btn-sm">
            ✕
          </button>
        </div>
        <div role="tablist" className="tabs tabs-bordered mb-3">
          <button
            type="button"
            role="tab"
            onClick={() => setMode('direct')}
            aria-selected={mode === 'direct'}
            className={`tab tab-md ${mode === 'direct' ? 'tab-active' : ''}`}>
            Direct
          </button>
          <button
            type="button"
            role="tab"
            onClick={() => setMode('group')}
            aria-selected={mode === 'group'}
            className={`tab tab-md ${mode === 'group' ? 'tab-active' : ''}`}>
            Group
          </button>
        </div>

        {mode === 'group' && (
          <input
            type="text"
            value={groupTitle}
            onChange={(event) => setGroupTitle(event.target.value)}
            placeholder="Group name (optional)"
            aria-label="Group name"
            className="input input-bordered mb-3 w-full"
          />
        )}

        <ul className="max-h-64 overflow-y-auto">
          {contacts.map((contact) => {
            const checked = selectedIds.includes(contact.id);
            return (
              <li key={contact.id}>
                <label className="hover:bg-base-200 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2">
                  {mode === 'group' && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(contact.id)}
                      aria-label={`Select ${contact.name}`}
                      className="checkbox checkbox-sm"
                    />
                  )}
                  <Avatar
                    name={contact.name}
                    color={contact.avatarColor}
                    online={contact.online}
                  />
                  <span className="flex-1 truncate font-medium">
                    {contact.name}
                  </span>
                  {mode === 'direct' && (
                    <button
                      type="button"
                      onClick={() => startDirect(contact.id)}
                      aria-label={`Start chat with ${contact.name}`}
                      className="btn btn-primary btn-sm">
                      Chat
                    </button>
                  )}
                </label>
              </li>
            );
          })}
        </ul>

        {mode === 'group' && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={startGroup}
              aria-label="Create group"
              className="btn btn-primary">
              Create group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
