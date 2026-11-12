import type { Conversation, Message } from '@/exhibit/types/ai';
import { db } from '@/exhibit/lib/ai/db';
import { MOCK_TITLES, MOCK_RESPONSES } from '@/exhibit/data/ai/models';

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: MOCK_TITLES[0],
    model: 'gpt-4o',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    pinned: true,
    archived: false,
  },
  {
    id: 'conv-2',
    title: MOCK_TITLES[1],
    model: 'claude-3.5',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    pinned: false,
    archived: false,
  },
  {
    id: 'conv-3',
    title: MOCK_TITLES[2],
    model: 'gemini-pro',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 2,
    pinned: false,
    archived: false,
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: 'msg-1-1',
    conversationId: 'conv-1',
    role: 'user',
    content: 'How do I create a typed array in TypeScript?',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'msg-1-2',
    conversationId: 'conv-1',
    role: 'assistant',
    content: MOCK_RESPONSES['gpt-4o'][0],
    model: 'gpt-4o',
    timestamp: Date.now() - 86400000 * 2 + 1000,
  },
  {
    id: 'msg-2-1',
    conversationId: 'conv-2',
    role: 'user',
    content: 'What are React best practices for hooks?',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'msg-2-2',
    conversationId: 'conv-2',
    role: 'assistant',
    content: MOCK_RESPONSES['claude-3.5'][0],
    model: 'claude-3.5',
    timestamp: Date.now() - 86400000 + 1000,
  },
  {
    id: 'msg-3-1',
    conversationId: 'conv-3',
    role: 'user',
    content: 'Explain Node.js event loop',
    timestamp: Date.now() - 3600000 * 5,
  },
  {
    id: 'msg-3-2',
    conversationId: 'conv-3',
    role: 'assistant',
    content: MOCK_RESPONSES['gemini-pro'][0],
    model: 'gemini-pro',
    timestamp: Date.now() - 3600000 * 5 + 1000,
  },
];

export const seedDatabase = async (): Promise<void> => {
  const existing = await db.conversations.getAll();
  if (existing.length > 0) return;

  for (const conv of SEED_CONVERSATIONS) {
    await db.conversations.put(conv);
  }
  for (const msg of SEED_MESSAGES) {
    await db.messages.put(msg);
  }
};

export const generateConversation = async (
  model: string
): Promise<Conversation> => {
  const conversation: Conversation = {
    id: generateId(),
    title: 'New Chat',
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pinned: false,
    archived: false,
  };
  await db.conversations.put(conversation);
  return conversation;
};

export const generateMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  model?: string
): Promise<Message> => {
  const message: Message = {
    id: generateId(),
    conversationId,
    role,
    content,
    model,
    timestamp: Date.now(),
  };
  await db.messages.put(message);
  return message;
};

export const generateAIResponse = (model: string): string => {
  const responses = MOCK_RESPONSES[model] ?? MOCK_RESPONSES['gpt-4o'];
  return responses[Math.floor(Math.random() * responses.length)];
};

export { generateId };
