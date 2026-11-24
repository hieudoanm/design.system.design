'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSearch, FiTrash2 } from 'react-icons/fi';

type LogLevel = 'info' | 'warn' | 'error';
type LogFilter = 'All' | 'Info' | 'Warn' | 'Error';

interface Log {
  id: string;
  level: LogLevel;
  message: string;
  time: string;
}

const INITIAL_LOGS: Log[] = [
  { id: 'l1', level: 'info', message: 'User signed in', time: 'Aug 7, 09:12' },
  { id: 'l2', level: 'info', message: 'Cache warmed', time: 'Aug 7, 09:10' },
  {
    id: 'l3',
    level: 'warn',
    message: 'Rate limit reached',
    time: 'Aug 7, 09:05',
  },
  {
    id: 'l4',
    level: 'error',
    message: 'Database connection failed',
    time: 'Aug 7, 09:00',
  },
  { id: 'l5', level: 'info', message: 'Report exported', time: 'Aug 7, 08:58' },
  {
    id: 'l6',
    level: 'warn',
    message: 'Slow query detected',
    time: 'Aug 7, 08:47',
  },
  {
    id: 'l7',
    level: 'error',
    message: 'Payment webhook rejected',
    time: 'Aug 7, 08:40',
  },
  {
    id: 'l8',
    level: 'info',
    message: 'Backup completed',
    time: 'Aug 7, 08:32',
  },
];

const FILTERS: LogFilter[] = ['All', 'Info', 'Warn', 'Error'];

const getLevelBadge = (level: LogLevel) => {
  if (level === 'error') {
    return <span className="badge badge-error badge-sm">error</span>;
  }
  if (level === 'warn') {
    return <span className="badge badge-warning badge-sm">warn</span>;
  }
  return <span className="badge badge-neutral badge-sm">info</span>;
};

export const LogsTemplate: FC = () => {
  const [logs, setLogs] = useState<Log[]>(INITIAL_LOGS);
  const [filter, setFilter] = useState<LogFilter>('All');
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const visible = logs.filter((log) => {
    const matchesLevel = filter === 'All' || log.level === filter.toLowerCase();
    const matchesQuery =
      !normalized || log.message.toLowerCase().includes(normalized);
    return matchesLevel && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Inspect application log output.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-base-content/50 text-sm">
              {visible.length} logs
            </p>
            <button
              onClick={() => setLogs([])}
              className="btn btn-outline btn-sm gap-1">
              <FiTrash2 />
              Clear logs
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs..."
            aria-label="Search logs"
            className="input input-bordered w-full pl-9"
          />
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          {visible.length === 0 ? (
            <p className="text-base-content/50 px-5 py-6 text-sm">
              No logs to display
            </p>
          ) : (
            <ul className="divide-base-content/10 divide-y">
              {visible.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                  <p className="text-base-content/50 w-32 shrink-0 text-xs">
                    {log.time}
                  </p>
                  {getLevelBadge(log.level)}
                  <p className="text-sm">{log.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

LogsTemplate.displayName = 'LogsTemplate';
