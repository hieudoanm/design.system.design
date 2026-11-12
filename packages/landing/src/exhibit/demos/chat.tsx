'use client';

import { type FC, useState, useEffect } from 'react';
import { AppShell } from '@/exhibit/components/chat/templates/AppShell';
import { Providers } from '@/exhibit/providers/chat/Providers';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { getChatIdFromURL } from '@/exhibit/lib/chat/url';

const HomePageContent: FC = () => {
  const { isLoading } = useData();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    const chatId = getChatIdFromURL();
    if (chatId) setSelectedChatId(chatId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <AppShell
      selectedChatId={selectedChatId}
      onSelectChat={setSelectedChatId}
    />
  );
};

const HomePage: FC = () => (
  <Providers>
    <HomePageContent />
  </Providers>
);

export default HomePage;
