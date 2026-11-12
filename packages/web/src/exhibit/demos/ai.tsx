'use client';

import { Sidebar } from '@/exhibit/components/ai/organisms/Sidebar';
import { PageTransition } from '@/exhibit/components/ai/templates/PageTransition';
import { Providers } from '@/exhibit/providers/ai/Providers';
import Link from 'next/link';
import { useState, type FC } from 'react';
import { FiDownload, FiMenu } from 'react-icons/fi';

const HomePage: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Providers>
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex flex-1 flex-col">
          <div className="border-base-300 flex items-center border-b px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn btn-ghost btn-circle">
              <FiMenu className="size-5" />
            </button>
            <span className="ml-2 text-lg font-bold">Chats</span>
            <Link
              href="/design-system/exhibits"
              className="btn btn-ghost btn-sm ml-auto gap-1.5"
              aria-label="Downloads">
              <FiDownload className="size-4" />
              Downloads
            </Link>
          </div>
          <PageTransition>
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <h1 className="text-base-content/30 mb-4 text-6xl font-bold">
                  AI Chat
                </h1>
                <p className="text-base-content/50 text-lg">
                  Select a conversation or start a new one
                </p>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </Providers>
  );
};

export default HomePage;
