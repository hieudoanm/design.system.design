import type { Chat, Message } from '@/exhibit/types/chat';

export const getChatMessages = (
  messages: Message[],
  chatId: string
): Message[] =>
  messages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => a.createdAt - b.createdAt);

const PREVIEW_LIMIT = 50;

export const getMessagePreviewText = (message: Message): string => {
  if (message.deletedAt !== undefined) return 'Message deleted';
  switch (message.type) {
    case 'image':
      return '📷 Photo';
    case 'audio':
      return '🎵 Voice message';
    case 'file':
      return `📎 ${message.fileName ?? 'File'}`;
    case 'system':
      return message.text;
    case 'text':
    default: {
      const text = message.text.replace(/\s+/g, ' ').trim();
      return text.length > PREVIEW_LIMIT
        ? `${text.slice(0, PREVIEW_LIMIT)}…`
        : text;
    }
  }
};

export const getLastMessagePreview = (
  chat: Chat,
  messages: Message[]
): string => {
  const chatMessages = messages.filter((m) => m.chatId === chat.id);
  if (chatMessages.length === 0) return '';
  const last = chatMessages.reduce((a, b) =>
    a.createdAt > b.createdAt ? a : b
  );
  return getMessagePreviewText(last);
};
