import type { Chat, AppSettings } from '@/exhibit/types/chat';

export const REPLY_POOL = [
  'Got it, thanks!',
  'Sounds good 👍',
  'Let me check and get back to you.',
  'Sure, talk soon!',
  'Haha nice!',
];

export const pickReply = (): string =>
  REPLY_POOL[Math.floor(Math.random() * REPLY_POOL.length)];

export const OTHER = 'me';

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'default',
  theme: 'exibit-light',
  notifications: true,
  readReceipts: true,
  typingIndicators: true,
  disappearingSeconds: 0,
};

export const getOtherParticipantId = (chat: Chat): string | undefined =>
  chat.kind === 'direct'
    ? chat.memberIds.find((id) => id !== OTHER)
    : undefined;
