'use client';

import { useState } from 'react';
import type { FC, ReactNode } from 'react';

interface PageTab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface PageTabsProps {
  tabs: PageTab[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PageTabs: FC<PageTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onChange,
}) => {
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id ?? '');
  const active = value ?? internal;

  const select = (id: string): void => {
    setInternal(id);
    onChange?.(id);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div role="tablist" aria-label="Page tabs" className="tabs tabs-boxed">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => select(tab.id)}
            className={`tab ${tab.id === active ? 'tab-active' : ''}`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tabs.find((tab) => tab.id === active)?.content ?? null}
      </div>
    </div>
  );
};
