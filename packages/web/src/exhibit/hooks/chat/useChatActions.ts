import { useCallback } from 'react';
import type { Chat, Contact, TypingState } from '@/exhibit/types/chat';
import { db } from '@/exhibit/lib/chat/db';
import { generateId } from '@/exhibit/data/chat/seed';
import { OTHER } from '@/exhibit/providers/chat/data-helpers';

interface UseChatActionsParams {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  contacts: Contact[];
  typingUsers: TypingState[];
  setTypingUsers: React.Dispatch<React.SetStateAction<TypingState[]>>;
}

export const useChatActions = ({
  chats,
  setChats,
  contacts,
  setTypingUsers,
}: UseChatActionsParams) => {
  const updateChatState = useCallback(
    (chatId: string, patch: Partial<Chat>) => {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const markChatRead = useCallback(
    async (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat || chat.unreadCount === 0) return;
      await db.chats.put({ ...chat, unreadCount: 0 });
      updateChatState(chatId, { unreadCount: 0 });
    },
    [chats, updateChatState]
  );

  const togglePin = useCallback(
    async (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;
      await db.chats.put({ ...chat, pinned: !chat.pinned });
      updateChatState(chatId, { pinned: !chat.pinned });
    },
    [chats, updateChatState]
  );

  const toggleMute = useCallback(
    async (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;
      await db.chats.put({ ...chat, muted: !chat.muted });
      updateChatState(chatId, { muted: !chat.muted });
    },
    [chats, updateChatState]
  );

  const toggleSecret = useCallback(
    async (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;
      const updated = {
        ...chat,
        isSecret: !chat.isSecret,
        disappearingSeconds: chat.isSecret ? 0 : 60,
      };
      await db.chats.put(updated);
      updateChatState(chatId, updated);
    },
    [chats, updateChatState]
  );

  const createChat = useCallback(
    async (contactId: string): Promise<Chat> => {
      const existing = chats.find(
        (c) => c.kind === 'direct' && c.memberIds.includes(contactId)
      );
      if (existing) return existing;
      const contact = contacts.find((c) => c.id === contactId);
      const chat: Chat = {
        id: generateId(),
        kind: 'direct',
        title: contact?.name ?? contactId,
        avatarColor: contact?.avatarColor ?? '#64748b',
        memberIds: [OTHER, contactId],
        adminIds: [],
        pinned: false,
        muted: false,
        isSecret: false,
        disappearingSeconds: 0,
        unreadCount: 0,
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
        settings: {
          wallpaper: '',
          notificationSound: true,
          disappearingSeconds: 0,
        },
      };
      await db.chats.put(chat);
      setChats((prev) => [chat, ...prev]);
      return chat;
    },
    [chats, contacts]
  );

  const createGroup = useCallback(
    async (title: string, memberIds: string[]): Promise<Chat> => {
      const chat: Chat = {
        id: generateId(),
        kind: 'group',
        title: title.trim() || 'New Group',
        avatarColor: '#ec4899',
        memberIds: [...new Set([OTHER, ...memberIds])],
        adminIds: [OTHER],
        pinned: false,
        muted: false,
        isSecret: false,
        disappearingSeconds: 0,
        unreadCount: 0,
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
        settings: {
          wallpaper: '',
          notificationSound: true,
          disappearingSeconds: 0,
        },
      };
      await db.chats.put(chat);
      setChats((prev) => [chat, ...prev]);
      return chat;
    },
    []
  );

  const promoteAdmin = useCallback(
    async (chatId: string, userId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat || chat.adminIds.includes(userId)) return;
      const updated = { ...chat, adminIds: [...chat.adminIds, userId] };
      await db.chats.put(updated);
      updateChatState(chatId, { adminIds: updated.adminIds });
    },
    [chats, updateChatState]
  );

  const demoteAdmin = useCallback(
    async (chatId: string, userId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;
      const updated = {
        ...chat,
        adminIds: chat.adminIds.filter((id) => id !== userId),
      };
      await db.chats.put(updated);
      updateChatState(chatId, { adminIds: updated.adminIds });
    },
    [chats, updateChatState]
  );

  const addGroupMember = useCallback(
    async (chatId: string, userId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat || chat.memberIds.includes(userId)) return;
      const updated = {
        ...chat,
        memberIds: [...chat.memberIds, userId],
        lastMessageAt: Date.now(),
      };
      await db.chats.put(updated);
      updateChatState(chatId, { memberIds: updated.memberIds });
    },
    [chats, updateChatState]
  );

  const removeGroupMember = useCallback(
    async (chatId: string, userId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;
      const updated = {
        ...chat,
        memberIds: chat.memberIds.filter((id) => id !== userId),
        adminIds: chat.adminIds.filter((id) => id !== userId),
      };
      await db.chats.put(updated);
      updateChatState(chatId, {
        memberIds: updated.memberIds,
        adminIds: updated.adminIds,
      });
    },
    [chats, updateChatState]
  );

  const setTyping = useCallback((chatId: string, typing: boolean) => {
    const state: TypingState = {
      chatId,
      userId: OTHER,
      typing,
      timestamp: Date.now(),
    };
    setTypingUsers((prev) => {
      const filtered = prev.filter(
        (t) => !(t.chatId === chatId && t.userId === OTHER)
      );
      return typing ? [...filtered, state] : filtered;
    });
  }, []);

  const updateChatSettings = useCallback(
    async (chatId: string, partial: Partial<Chat['settings']>) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;
      const updated = {
        ...chat,
        settings: { ...chat.settings, ...partial },
      };
      await db.chats.put(updated);
      updateChatState(chatId, { settings: updated.settings });
    },
    [chats, updateChatState]
  );

  return {
    markChatRead,
    togglePin,
    toggleMute,
    toggleSecret,
    createChat,
    createGroup,
    promoteAdmin,
    demoteAdmin,
    addGroupMember,
    removeGroupMember,
    setTyping,
    updateChatSettings,
  };
};
