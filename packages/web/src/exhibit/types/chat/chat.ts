export type ChatKind = 'direct' | 'group';

export type Tab = 'chats' | 'contacts' | 'calls' | 'devices';

export type GroupRole = 'owner' | 'admin' | 'member';

export interface ChatSettings {
  wallpaper: string;
  notificationSound: boolean;
  disappearingSeconds: number;
}

export interface Chat {
  id: string;
  kind: ChatKind;
  title: string;
  avatarColor: string;
  memberIds: string[];
  adminIds: string[];
  pinned: boolean;
  muted: boolean;
  isSecret: boolean;
  disappearingSeconds: number;
  unreadCount: number;
  createdAt: number;
  lastMessageAt: number;
  settings: ChatSettings;
  isIncognito?: boolean;
}

export interface StickerPack {
  id: string;
  name: string;
  thumbnails: string[];
  stickers: string[];
}

export interface ForwardSelection {
  messageId: string;
  targetChatIds: string[];
}
