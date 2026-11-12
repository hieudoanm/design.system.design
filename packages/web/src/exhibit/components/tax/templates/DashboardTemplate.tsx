'use client';

import { type FC, type ReactNode, useState } from 'react';
import { Sidebar } from '@/exhibit/components/tax/organisms/Sidebar';
import { BottomNav } from '@/exhibit/components/tax/organisms/BottomNav';

interface DashboardTemplateProps {
  children: ReactNode;
}

export const DashboardTemplate: FC<DashboardTemplateProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 pb-20 md:p-6">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};
