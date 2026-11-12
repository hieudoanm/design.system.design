import { useCallback } from 'react';
import type {
  Chat,
  Contact,
  Message,
  UploadProgress,
  MediaAttachment,
  PrivacySettings,
} from '@/exhibit/types/chat';
import { db } from '@/exhibit/lib/chat/db';
import { generateId } from '@/exhibit/data/chat/seed';
import {
  generateKeyPair,
  deriveSharedKey,
  encrypt,
  exportSharedKey,
} from '@/exhibit/lib/chat/crypto';
import { OTHER, pickReply } from '@/exhibit/providers/chat/data-helpers';

interface UseMessageActionsParams {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  contacts: Contact[];
  privacySettings: PrivacySettings;
  uploadProgress: Map<string, UploadProgress>;
  setUploadProgress: React.Dispatch<
    React.SetStateAction<Map<string, UploadProgress>>
  >;
}

export const useMessageActions = ({
  messages,
  setMessages,
  chats,
  setChats,
  contacts,
  privacySettings,
  setUploadProgress,
}: UseMessageActionsParams) => {
  const updateChatState = useCallback(
    (chatId: string, patch: Partial<Chat>) => {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const updateMessageState = useCallback(
    (messageId: string, patch: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...patch } : m))
      );
    },
    []
  );

  const updateMessageStatus = useCallback(
    (messageId: string, status: Message['status']) => {
      updateMessageState(messageId, { status });
    },
    [updateMessageState]
  );

  const deliver = useCallback(
    async (message: Message) => {
      await db.messages.put(message);
      const readReceipts = (await db.settings.get()).readReceipts;
      setTimeout(() => updateMessageStatus(message.id, 'delivered'), 1200);
      if (readReceipts) {
        setTimeout(() => updateMessageStatus(message.id, 'read'), 2600);
      }
    },
    [updateMessageStatus]
  );

  const persistMessage = useCallback(
    async (message: Message, chat: Chat) => {
      await db.messages.put(message);
      const updatedChat = { ...chat, lastMessageAt: message.createdAt };
      await db.chats.put(updatedChat);
      setMessages((prev) => [...prev, message]);
      updateChatState(chat.id, { lastMessageAt: message.createdAt });
      return message;
    },
    [updateChatState]
  );

  const scheduleMockReply = useCallback(
    async (chat: Chat) => {
      const otherId =
        chat.kind === 'direct'
          ? chat.memberIds.find((id) => id !== OTHER)
          : undefined;
      if (!otherId) return;
      if (privacySettings.blockedContactIds.includes(otherId)) return;
      const contact = contacts.find((c) => c.id === otherId);
      if (!contact) return;
      const createdAt = Date.now() + 3200;
      setTimeout(() => {
        void (async () => {
          const reply: Message = {
            id: generateId(),
            chatId: chat.id,
            authorId: otherId,
            type: 'text',
            text: pickReply(),
            status: 'sent',
            createdAt,
            reactions: [],
          };
          await db.messages.put(reply);
          await db.chats.put({
            ...chat,
            lastMessageAt: createdAt,
            unreadCount: chat.unreadCount + 1,
          });
          setMessages((prev) => [...prev, reply]);
          updateChatState(chat.id, {
            lastMessageAt: createdAt,
            unreadCount: chat.unreadCount + 1,
          });
        })();
      }, 3000);
    },
    [contacts, updateChatState, privacySettings.blockedContactIds]
  );

  const sendMessage = useCallback(
    async (
      chatId: string,
      text: string,
      replyToId?: string
    ): Promise<Message> => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat || text.trim() === '')
        throw new Error('Chat not found or empty message');
      let messageText = text.trim();
      let encrypted = false;
      if (chat.isSecret) {
        try {
          const keys = await generateKeyPair();
          const fakePeerKeys = await generateKeyPair();
          const shared = await deriveSharedKey(
            keys.privateKey,
            fakePeerKeys.publicKey
          );
          const sharedB64 = await exportSharedKey(shared);
          messageText = await encrypt(messageText, sharedB64);
          encrypted = true;
          void keys;
        } catch {
          // fallback to plaintext if crypto fails
        }
      }
      const message: Message = {
        id: generateId(),
        chatId,
        authorId: OTHER,
        type: 'text',
        text: messageText,
        status: 'sending',
        createdAt: Date.now(),
        reactions: [],
        replyToId,
        encrypted,
      };
      await persistMessage(message, chat);
      await deliver(message);
      void scheduleMockReply(chat);
      return message;
    },
    [chats, deliver, persistMessage, scheduleMockReply]
  );

  const addReaction = useCallback(
    async (chatId: string, messageId: string, emoji: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;
      const mine = message.reactions.find(
        (r) => r.authorId === OTHER && r.emoji === emoji
      );
      const reactions = mine
        ? message.reactions.filter((r) => r !== mine)
        : [
            ...message.reactions.filter((r) => r.authorId !== OTHER),
            { emoji, authorId: OTHER, createdAt: Date.now() },
          ];
      const updated = { ...message, reactions };
      await db.messages.put(updated);
      updateMessageState(messageId, { reactions });
    },
    [messages, updateMessageState]
  );

  const deleteMessage = useCallback(
    async (chatId: string, messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;
      const updated = { ...message, deletedAt: Date.now() };
      await db.messages.put(updated);
      updateMessageState(messageId, { deletedAt: updated.deletedAt });
    },
    [messages, updateMessageState]
  );

  const deleteForEveryone = useCallback(
    async (chatId: string, messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;
      const updated = {
        ...message,
        deletedAt: Date.now(),
        text: 'Deleted for everyone',
      };
      await db.messages.put(updated);
      updateMessageState(messageId, {
        deletedAt: updated.deletedAt,
        text: updated.text,
      });
    },
    [messages, updateMessageState]
  );

  const editMessage = useCallback(
    async (chatId: string, messageId: string, text: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || text.trim() === '') return;
      const updated = { ...message, text: text.trim(), editedAt: Date.now() };
      await db.messages.put(updated);
      updateMessageState(messageId, {
        text: updated.text,
        editedAt: updated.editedAt,
      });
    },
    [messages, updateMessageState]
  );

  const forwardMessage = useCallback(
    async (messageId: string, targetChatId: string) => {
      const message = messages.find((m) => m.id === messageId);
      const targetChat = chats.find((c) => c.id === targetChatId);
      if (!message || !targetChat || message.deletedAt !== undefined) return;
      const forwarded: Message = {
        id: generateId(),
        chatId: targetChatId,
        authorId: OTHER,
        type: message.type,
        text: message.text,
        status: 'sending',
        createdAt: Date.now(),
        reactions: [],
      };
      await persistMessage(forwarded, targetChat);
      await deliver(forwarded);
    },
    [messages, chats, persistMessage, deliver]
  );

  const forwardToMultiple = useCallback(
    async (messageId: string, targetChatIds: string[]) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.deletedAt !== undefined) return;
      for (const targetId of targetChatIds) {
        const targetChat = chats.find((c) => c.id === targetId);
        if (!targetChat) continue;
        const forwarded: Message = {
          id: generateId(),
          chatId: targetId,
          authorId: OTHER,
          type: message.type,
          text: message.text,
          status: 'sending',
          createdAt: Date.now(),
          reactions: [],
          mediaUrl: message.mediaUrl,
          mediaThumbnail: message.mediaThumbnail,
          mediaDuration: message.mediaDuration,
          mediaMimeType: message.mediaMimeType,
          fileName: message.fileName,
          fileSize: message.fileSize,
          stickerUrl: message.stickerUrl,
          linkPreview: message.linkPreview,
        };
        await persistMessage(forwarded, targetChat);
        await deliver(forwarded);
      }
    },
    [messages, chats, persistMessage, deliver]
  );

  const updateUploadProgressFn = useCallback(
    (messageId: string, progress: UploadProgress) => {
      setUploadProgress((prev) => {
        const next = new Map(prev);
        next.set(messageId, progress);
        return next;
      });
    },
    []
  );

  const sendMediaMessage = useCallback(
    async (
      chatId: string,
      attachment: MediaAttachment,
      caption: string
    ): Promise<Message> => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) throw new Error('Chat not found');
      const messageType =
        attachment.type === 'image'
          ? 'image'
          : attachment.type === 'video'
            ? 'video'
            : attachment.type === 'audio'
              ? 'audio'
              : 'file';
      const message: Message = {
        id: generateId(),
        chatId,
        authorId: OTHER,
        type: messageType,
        text: caption,
        status: 'sending',
        createdAt: Date.now(),
        reactions: [],
        mediaUrl: attachment.url,
        mediaMimeType: attachment.file.type,
        fileName: attachment.file.name,
        fileSize: attachment.file.size,
      };
      updateUploadProgressFn(message.id, {
        messageId: message.id,
        progress: 0,
        status: 'uploading',
      });
      await persistMessage(message, chat);
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 80));
        updateUploadProgressFn(message.id, {
          messageId: message.id,
          progress: i,
          status: i < 100 ? 'uploading' : 'processing',
        });
      }
      updateUploadProgressFn(message.id, {
        messageId: message.id,
        progress: 100,
        status: 'done',
      });
      await deliver(message);
      void scheduleMockReply(chat);
      return message;
    },
    [chats, persistMessage, deliver, scheduleMockReply, updateUploadProgressFn]
  );

  const sendSticker = useCallback(
    async (chatId: string, stickerUrl: string): Promise<Message> => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) throw new Error('Chat not found');
      const message: Message = {
        id: generateId(),
        chatId,
        authorId: OTHER,
        type: 'sticker',
        text: '',
        status: 'sending',
        createdAt: Date.now(),
        reactions: [],
        stickerUrl,
      };
      await persistMessage(message, chat);
      await deliver(message);
      void scheduleMockReply(chat);
      return message;
    },
    [chats, persistMessage, deliver, scheduleMockReply]
  );

  const getMediaMessages = useCallback(
    (chatId: string): Message[] =>
      messages.filter(
        (m) =>
          m.chatId === chatId &&
          m.deletedAt === undefined &&
          (m.type === 'image' ||
            m.type === 'video' ||
            m.type === 'audio' ||
            m.type === 'file')
      ),
    [messages]
  );

  return {
    sendMessage,
    addReaction,
    deleteMessage,
    deleteForEveryone,
    editMessage,
    forwardMessage,
    forwardToMultiple,
    sendMediaMessage,
    sendSticker,
    getMediaMessages,
    updateUploadProgress: updateUploadProgressFn,
  };
};
