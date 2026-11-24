'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiActivity, FiCheck, FiFileText, FiGrid } from 'react-icons/fi';

type TabKey = 'overview' | 'activity' | 'details';

interface Tab {
  key: TabKey;
  label: string;
  icon: FC<{ className?: string }>;
}

const TABS: Tab[] = [
  { key: 'overview', label: 'Overview', icon: FiGrid },
  { key: 'activity', label: 'Activity', icon: FiActivity },
  { key: 'details', label: 'Details', icon: FiFileText },
];

const ACTIVITIES = [
  'Alice updated the roadmap',
  'Bob merged a pull request',
  'Cara deployed to production',
];

export const TabsTemplate: FC = () => {
  const [tab, setTab] = useState<TabKey>('overview');
  const [unread, setUnread] = useState(3);

  const markAllRead = () => setUnread(0);

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Tabs
          </p>
          <h1>Tabs showcase</h1>
          <p className="text-base-content/50 text-sm">
            Boxed tabs that swap content panels.
          </p>
        </div>

        <div className="tabs tabs-boxed w-fit" role="tablist">
          {TABS.map((tabDef) => {
            const Icon = tabDef.icon;
            return (
              <button
                key={tabDef.key}
                type="button"
                role="tab"
                aria-selected={tab === tabDef.key}
                onClick={() => setTab(tabDef.key)}
                className={`tab gap-2 ${tab === tabDef.key ? 'tab-active' : ''}`}>
                <Icon className="h-4 w-4" />
                {tabDef.label}
              </button>
            );
          })}
        </div>

        {tab === 'overview' && (
          <div className="card border-base-content/10 bg-base-200 border">
            <div className="card-body p-5">
              <h3>Overview</h3>
              <p className="text-base-content/60 text-sm">
                A quick look at your workspace metrics and activity.
              </p>
              <div className="stats stats-vertical sm:stats-horizontal">
                <div className="stat">
                  <div className="stat-title">Projects</div>
                  <div className="stat-value">12</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Tasks</div>
                  <div className="stat-value">84</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="card border-base-content/10 bg-base-200 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <h3>Activity</h3>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="btn btn-primary btn-sm gap-1">
                  <FiCheck className="h-4 w-4" />
                  Mark all read
                </button>
              </div>
              {unread > 0 ? (
                <p className="text-base-content/60 text-sm">
                  You have {unread} unread notifications.
                </p>
              ) : (
                <p className="text-base-content/60 text-sm">
                  All caught up. No unread notifications.
                </p>
              )}
              <ul className="text-base-content/70 flex flex-col gap-2 text-sm">
                {ACTIVITIES.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'details' && (
          <div className="card border-base-content/10 bg-base-200 border">
            <div className="card-body p-5">
              <h3>Details</h3>
              <p className="text-base-content/60 text-sm">
                Workspace version 2.4.1, plan Pro, owner Alice Smith.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-primary badge-sm">
                  Version 2.4.1
                </span>
                <span className="badge badge-neutral badge-sm">Pro plan</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

TabsTemplate.displayName = 'TabsTemplate';
