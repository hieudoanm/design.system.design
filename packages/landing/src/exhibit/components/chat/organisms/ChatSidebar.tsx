'use client';

import { type FC, useMemo, useState } from 'react';
import { FaUserPlus, FaPhone, FaDesktop } from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { ChatListItem } from '@/exhibit/components/chat/molecules/ChatListItem';
import { SearchBar } from '@/exhibit/components/chat/molecules/SearchBar';
import { EmptyState } from '@/exhibit/components/chat/atoms/EmptyState';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import { CallHistoryPanel } from '@/exhibit/components/chat/organisms/CallHistoryPanel';
import { DeviceSyncPanel } from '@/exhibit/components/chat/organisms/DeviceSyncPanel';
import { getLastMessagePreview } from '@/exhibit/lib/chat/selectors';
import type { Tab } from '@/exhibit/types/chat';

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onPairDevice?: () => void;
}

export const ChatSidebar: FC<ChatSidebarProps> = ({
  selectedChatId,
  onSelectChat,
  onNewChat,
  onPairDevice,
}: ChatSidebarProps) => {
  const { account, chats, messages, contacts, privacySettings } = useData();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('chats');
  const [, setShowCallHistory] = useState(false);
  const [, setShowDeviceSync] = useState(false);

  const filteredChats = useMemo(() => {
    const sorted = [...chats].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.lastMessageAt - a.lastMessageAt;
    });
    const term = query.trim().toLowerCase();
    if (term === '') return sorted;
    return sorted.filter((c) => c.title.toLowerCase().includes(term));
  }, [chats, query]);

  const filteredContacts = useMemo(() => {
    const term = query.trim().toLowerCase();
    const visible = contacts.filter(
      (c) => !privacySettings.blockedContactIds.includes(c.id)
    );
    if (term === '') return visible;
    return visible.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.username.toLowerCase().includes(term)
    );
  }, [contacts, query, privacySettings.blockedContactIds]);

  const renderList = (): React.ReactNode => {
    if (tab === 'contacts') {
      if (filteredContacts.length === 0) {
        return (
          <EmptyState
            icon={FaUserPlus}
            title="No contacts"
            description="Search for someone to start chatting."
          />
        );
      }
      return filteredContacts.map((contact) => (
        <button
          key={contact.id}
          type="button"
          onClick={() => onSelectChat(contact.id)}
          aria-label={`Start chat with ${contact.name}`}
          className="hover:bg-base-200 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors">
          <Avatar
            name={contact.name}
            color={contact.avatarColor}
            online={contact.online}
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{contact.name}</span>
            <span className="text-base-content/50 block truncate text-xs">
              @{contact.username}
            </span>
          </div>
        </button>
      ));
    }
    if (filteredChats.length === 0) {
      return (
        <EmptyState
          icon={FaUserPlus}
          title="No chats"
          description="Start a conversation with one of your contacts."
        />
      );
    }
    return filteredChats.map((chat) => (
      <ChatListItem
        key={chat.id}
        id={chat.id}
        title={chat.title}
        avatarColor={chat.avatarColor}
        kind={chat.kind}
        online={
          contacts.find((c) => chat.memberIds.includes(c.id))?.online ?? false
        }
        preview={getLastMessagePreview(chat, messages)}
        lastMessageAt={chat.lastMessageAt}
        unreadCount={chat.unreadCount}
        muted={chat.muted}
        selected={chat.id === selectedChatId}
        onSelect={onSelectChat}
      />
    ));
  };

  return (
    <aside className="border-base-300 bg-base-100 flex h-full w-full flex-col overflow-hidden border-r md:w-80 md:min-w-80">
      <div className="flex items-center gap-2 px-4 py-3">
        <Avatar
          name={account?.name ?? 'You'}
          color={account?.avatarColor ?? '#ff0030'}
          online={account?.online}
        />
        <h1 className="flex-1 text-lg font-bold">Messaging</h1>
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat"
          className="btn btn-primary btn-circle btn-sm">
          <FaUserPlus aria-hidden="true" />
        </button>
      </div>
      <div className="px-3 pb-2">
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <div role="tablist" className="tabs tabs-bordered px-3">
        <button
          type="button"
          role="tab"
          onClick={() => setTab('chats')}
          aria-selected={tab === 'chats'}
          className={`tab tab-md ${tab === 'chats' ? 'tab-active' : ''}`}>
          Chats
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => setTab('contacts')}
          aria-selected={tab === 'contacts'}
          className={`tab tab-md ${tab === 'contacts' ? 'tab-active' : ''}`}>
          Contacts
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => {
            setTab('calls');
            setShowCallHistory(true);
          }}
          aria-selected={tab === 'calls'}
          className={`tab tab-md ${tab === 'calls' ? 'tab-active' : ''}`}>
          <FaPhone className="h-3 w-3" />
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => {
            setTab('devices');
            setShowDeviceSync(true);
          }}
          aria-selected={tab === 'devices'}
          className={`tab tab-md ${tab === 'devices' ? 'tab-active' : ''}`}>
          <FaDesktop className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {tab === 'calls' ? (
          <CallHistoryPanel
            onClose={() => {
              setTab('chats');
              setShowCallHistory(false);
            }}
            onCallBack={(chatId) => onSelectChat(chatId)}
          />
        ) : tab === 'devices' ? (
          <DeviceSyncPanel
            onClose={() => {
              setTab('chats');
              setShowDeviceSync(false);
            }}
            onPairNew={() => {
              setShowDeviceSync(false);
              setTab('chats');
              onPairDevice?.();
            }}
          />
        ) : (
          renderList()
        )}
      </div>
    </aside>
  );
};
