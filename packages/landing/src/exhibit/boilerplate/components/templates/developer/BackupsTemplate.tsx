'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiDownload, FiPlus } from 'react-icons/fi';

type BackupStatus = 'Completed' | 'Running' | 'Failed';

interface Backup {
  id: string;
  name: string;
  size: string;
  time: string;
  status: BackupStatus;
}

const BACKUPS: Backup[] = [
  {
    id: 'b1',
    name: 'Production database',
    size: '4.2 GB',
    time: 'Aug 6, 2026 02:00',
    status: 'Completed',
  },
  {
    id: 'b2',
    name: 'User uploads',
    size: '1.8 GB',
    time: 'Aug 6, 2026 01:00',
    status: 'Completed',
  },
  {
    id: 'b3',
    name: 'Analytics warehouse',
    size: '12.4 GB',
    time: 'Aug 5, 2026 02:00',
    status: 'Running',
  },
  {
    id: 'b4',
    name: 'Search index',
    size: '650 MB',
    time: 'Aug 5, 2026 01:00',
    status: 'Completed',
  },
  {
    id: 'b5',
    name: 'Audit logs',
    size: '210 MB',
    time: 'Aug 4, 2026 02:00',
    status: 'Failed',
  },
];

const getStatusBadge = (status: BackupStatus) => {
  switch (status) {
    case 'Running':
      return <span className="badge badge-info badge-sm">Running</span>;
    case 'Failed':
      return <span className="badge badge-error badge-sm">Failed</span>;
    default:
      return <span className="badge badge-success badge-sm">Completed</span>;
  }
};

export const BackupsTemplate: FC = () => {
  const [backups, setBackups] = useState<Backup[]>(BACKUPS);
  const [message, setMessage] = useState<string | null>(null);

  const completedCount = backups.filter(
    (backup) => backup.status === 'Completed'
  ).length;

  const createBackup = () => {
    setBackups((prev) => [
      {
        id: `backup${Date.now()}`,
        name: 'On-demand backup',
        size: '0 B',
        time: 'Aug 7, 2026',
        status: 'Running',
      },
      ...prev,
    ]);
    setMessage('Backup created');
  };

  const setStatus = (id: string, status: BackupStatus) => {
    setBackups((prev) =>
      prev.map((backup) => (backup.id === id ? { ...backup, status } : backup))
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Backups</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Manage backup schedules and restores.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">
            {completedCount} completed backups
          </p>
          <button
            onClick={createBackup}
            className="btn btn-primary btn-sm gap-1">
            <FiPlus />
            Create backup
          </button>
        </div>

        {message === 'Backup created' && (
          <p className="text-success mb-4 text-sm">Backup created</p>
        )}

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Backup</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr
                      key={backup.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {backup.name}
                      </td>
                      <td className="px-4 py-3 text-sm">{backup.size}</td>
                      <td className="px-4 py-3 text-sm">{backup.time}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(backup.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {backup.status === 'Running' && (
                          <button
                            onClick={() => setStatus(backup.id, 'Completed')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiCheck />
                            Mark complete
                          </button>
                        )}
                        {backup.status === 'Completed' && (
                          <button
                            onClick={() => setStatus(backup.id, 'Running')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiDownload />
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

BackupsTemplate.displayName = 'BackupsTemplate';
