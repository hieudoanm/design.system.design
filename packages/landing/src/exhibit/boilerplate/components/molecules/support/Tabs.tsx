'use client';

import type { FC } from 'react';

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
}

export const Tabs: FC<TabsProps> = ({ tabs, value, onChange }) => (
  <div className="border-base-300 border-b">
    <div className="flex gap-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`btn btn-sm btn-ghost rounded-b-none ${value === tab.value ? 'text-primary border-primary border-b-2' : ''}`}>
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);
