'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMonitor, FiShield, FiSmartphone } from 'react-icons/fi';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const initialSessions: ActiveSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome 138',
    os: 'macOS 15',
    location: 'Ho Chi Minh City, VN',
    lastActive: 'Now',
    current: true,
  },
  {
    id: '2',
    device: 'Windows Desktop',
    browser: 'Firefox 137',
    os: 'Windows 11',
    location: 'Hanoi, VN',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: '3',
    device: 'iPhone 16',
    browser: 'Safari 20',
    os: 'iOS 19',
    location: 'Da Nang, VN',
    lastActive: 'Yesterday',
    current: false,
  },
];

export const SessionsTemplate: FC = () => {
  const [sessions, setSessions] = useState(initialSessions);

  const revoke = (id: string) =>
    setSessions((prev) => prev.filter((session) => session.id !== id));

  const signOutElsewhere = () =>
    setSessions((prev) => prev.filter((session) => session.current));

  const onlyCurrent = sessions.length === 1 && sessions[0].current;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Sessions" backHref="/" />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>Active sessions</h2>
            <p className="text-base-content/50 mt-1 text-sm">
              {sessions.length} active sessions
            </p>
          </div>
          <button
            type="button"
            onClick={signOutElsewhere}
            disabled={onlyCurrent}
            className="btn btn-outline btn-sm">
            Sign out everywhere else
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border py-24 text-center">
            <FiShield className="text-base-content/20 h-12 w-12" />
            <p className="text-base-content/50 text-sm">No active sessions</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border-base-content/10 bg-base-200 flex items-start justify-between gap-4 rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-base-300 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    {session.device.includes('iPhone') ? (
                      <FiSmartphone className="text-base-content/40 h-5 w-5" />
                    ) : (
                      <FiMonitor className="text-base-content/40 h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {session.browser} on {session.os}
                      </p>
                      {session.current && (
                        <span className="badge badge-primary badge-sm">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-base-content/50 mt-0.5 text-xs">
                      {session.location}
                    </p>
                    <p className="text-base-content/40 mt-0.5 text-xs">
                      Last active {session.lastActive}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => revoke(session.id)}
                  className="btn btn-ghost btn-xs text-error">
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

SessionsTemplate.displayName = 'SessionsTemplate';
