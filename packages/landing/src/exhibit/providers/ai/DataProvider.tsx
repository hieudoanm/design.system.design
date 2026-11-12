'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Conversation, Message, Folder, Settings } from '@/exhibit/types/ai';
import { db } from '@/exhibit/lib/ai/db';
import {
  seedDatabase,
  generateConversation,
  generateMessage,
  generateAIResponse,
} from '@/exhibit/data/ai/seed';

interface DataContextType {
  conversations: Conversation[];
  messages: Message[];
  folders: Folder[];
  settings: Settings;
  currentConversation: Conversation | null;
  currentMessages: Message[];
  isLoading: boolean;
  createConversation: (model?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  duplicateConversation: (id: string) => Promise<Conversation>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string, model?: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  updateMessageReaction: (
    id: string,
    reaction: 'thumbs-up' | 'thumbs-down' | null
  ) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  createFolder: (name: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  moveToFolder: (conversationId: string, folderId?: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'exibit-light',
    defaultModel: 'gpt-4o',
    systemPrompt: '',
    mockDelay: 800,
  });
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await seedDatabase();
    const [convs, msgs, flds, sett] = await Promise.all([
      db.conversations.getAll(),
      db.messages.getAll(),
      db.folders.getAll(),
      db.settings.get(),
    ]);
    setConversations(convs.sort((a, b) => b.updatedAt - a.updatedAt));
    setMessages(msgs);
    setFolders(flds);
    setSettings(sett);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentMessages = currentConversation
    ? messages
        .filter((m) => m.conversationId === currentConversation.id)
        .sort((a, b) => a.timestamp - b.timestamp)
    : [];

  const createConversation = useCallback(
    async (model?: string): Promise<Conversation> => {
      const conv = await generateConversation(model ?? settings.defaultModel);
      setConversations((prev) => [conv, ...prev]);
      return conv;
    },
    [settings.defaultModel]
  );

  const deleteConversation = useCallback(async (id: string) => {
    await db.conversations.delete(id);
    await db.messages.deleteByConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => prev.filter((m) => m.conversationId !== id));
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    const conv = await db.conversations.get(id);
    if (conv) {
      const updated = { ...conv, title, updatedAt: Date.now() };
      await db.conversations.put(updated);
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }, []);

  const duplicateConversation = useCallback(
    async (id: string): Promise<Conversation> => {
      const original = await db.conversations.get(id);
      if (!original) throw new Error('Conversation not found');
      const newConv = await createConversation(original.model);
      await renameConversation(newConv.id, `${original.title} (Copy)`);
      const originalMessages = messages.filter((m) => m.conversationId === id);
      for (const msg of originalMessages) {
        await generateMessage(newConv.id, msg.role, msg.content, msg.model);
      }
      await refreshData();
      return newConv;
    },
    [messages, createConversation, renameConversation, refreshData]
  );

  const sendMessage = useCallback(
    async (content: string, model?: string) => {
      if (!currentConversation) return;
      const modelToUse = model ?? currentConversation.model;
      await generateMessage(currentConversation.id, 'user', content);
      const aiContent = generateAIResponse(modelToUse);
      await generateMessage(
        currentConversation.id,
        'assistant',
        aiContent,
        modelToUse
      );
      const updated = {
        ...currentConversation,
        updatedAt: Date.now(),
        model: modelToUse,
      };
      await db.conversations.put(updated);
      setCurrentConversation(updated);
      await refreshData();
    },
    [currentConversation, refreshData]
  );

  const deleteMessage = useCallback(async (id: string) => {
    await db.messages.delete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMessageReaction = useCallback(
    async (id: string, reaction: 'thumbs-up' | 'thumbs-down' | null) => {
      const msg = await db.messages.get(id);
      if (msg) {
        const updated = { ...msg, reaction };
        await db.messages.put(updated);
        setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      }
    },
    []
  );

  const togglePin = useCallback(async (id: string) => {
    const conv = await db.conversations.get(id);
    if (conv) {
      const updated = { ...conv, pinned: !conv.pinned };
      await db.conversations.put(updated);
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }, []);

  const toggleArchive = useCallback(async (id: string) => {
    const conv = await db.conversations.get(id);
    if (conv) {
      const updated = { ...conv, archived: !conv.archived };
      await db.conversations.put(updated);
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }, []);

  const createFolder = useCallback(async (name: string): Promise<Folder> => {
    const folder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: Date.now(),
    };
    await db.folders.put(folder);
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    await db.folders.delete(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const moveToFolder = useCallback(
    async (conversationId: string, folderId?: string) => {
      const conv = await db.conversations.get(conversationId);
      if (conv) {
        const updated = { ...conv, folderId, updatedAt: Date.now() };
        await db.conversations.put(updated);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? updated : c))
        );
      }
    },
    []
  );

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const current = await db.settings.get();
    const updated = { ...current, ...partial };
    await db.settings.put(updated);
    setSettings(updated);
  }, []);

  return (
    <DataContext.Provider
      value={{
        conversations,
        messages,
        folders,
        settings,
        currentConversation,
        currentMessages,
        isLoading,
        createConversation,
        deleteConversation,
        renameConversation,
        duplicateConversation,
        setCurrentConversation,
        sendMessage,
        deleteMessage,
        updateMessageReaction,
        togglePin,
        toggleArchive,
        createFolder,
        deleteFolder,
        moveToFolder,
        updateSettings,
        refreshData,
      }}>
      {children}
    </DataContext.Provider>
  );
};
