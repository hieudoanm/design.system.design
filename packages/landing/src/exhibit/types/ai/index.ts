export type MessageReaction = 'thumbs-up' | 'thumbs-down' | null;

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
  reaction?: MessageReaction;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  folderId?: string;
  pinned: boolean;
  archived: boolean;
  systemPrompt?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface AIModel {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  contextWindow: string;
  capabilities: string[];
  responseStyle: string;
}

export interface Settings {
  theme: string;
  defaultModel: string;
  systemPrompt: string;
  mockDelay: number;
}
