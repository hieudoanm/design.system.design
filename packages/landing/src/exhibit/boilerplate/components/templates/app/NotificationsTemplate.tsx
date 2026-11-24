'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiAlertCircle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiX,
} from 'react-icons/fi';

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type FilterTab = 'all' | 'unread';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'info',
    title: 'Welcome to the workspace',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'success',
    title: 'Deploy completed',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'warning',
    title: 'Storage usage is high',
    time: '3 hrs ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'error',
    title: 'Payment failed',
    time: '1 day ago',
    read: false,
  },
];

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return <FiInfo className="text-info h-4 w-4" />;
    case 'success':
      return <FiCheckCircle className="text-success h-4 w-4" />;
    case 'warning':
      return <FiAlertCircle className="text-warning h-4 w-4" />;
    default:
      return <FiAlertCircle className="text-error h-4 w-4" />;
  }
};

export const NotificationsTemplate: FC = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterTab>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Stay up to date with activity in your workspace.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${
                filter === 'all' ? 'btn-primary' : 'btn-ghost'
              }`}>
              All
              <span className="badge badge-neutral badge-sm">
                {notifications.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`btn btn-sm ${
                filter === 'unread' ? 'btn-primary' : 'btn-ghost'
              }`}>
              Unread
              <span className="badge badge-neutral badge-sm">
                {unreadCount}
              </span>
            </button>
          </div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="btn btn-outline btn-sm">
            <FiCheck />
            Mark all read
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <FiBell className="text-base-content/30 h-8 w-8" />
              <p className="text-base-content/50 text-sm">No notifications</p>
            </div>
          ) : (
            visible.map((notification) => (
              <div
                key={notification.id}
                className={`card ${
                  notification.read
                    ? 'bg-base-100 border-base-content/10'
                    : 'bg-base-200 border-primary/30'
                } border`}>
                <div className="card-body flex-row items-center gap-3 p-4">
                  <span className="bg-base-300 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    {getTypeIcon(notification.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${
                        notification.read
                          ? 'text-base-content/60'
                          : 'font-semibold'
                      }`}>
                      {notification.title}
                    </p>
                    <p className="text-base-content/40 text-xs">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="bg-primary h-2 w-2 shrink-0 rounded-full" />
                  )}
                  <button
                    onClick={() => dismiss(notification.id)}
                    className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error"
                    title="Dismiss">
                    <FiX />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

NotificationsTemplate.displayName = 'NotificationsTemplate';
