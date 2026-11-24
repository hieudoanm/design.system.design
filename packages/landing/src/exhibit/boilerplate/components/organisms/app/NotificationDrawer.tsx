'use client';

import type { FC } from 'react';

interface Notification {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
}

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead?: () => void;
}

export const NotificationDrawer: FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!open) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div
      data-testid="notification-drawer"
      role="dialog"
      aria-label="Notifications"
      className="fixed inset-0 z-50">
      <div
        data-testid="drawer-backdrop"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside className="bg-base-100 absolute top-0 right-0 flex h-full w-80 max-w-full flex-col shadow-2xl">
        <div className="border-base-200 flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <h3 className="card-title text-base">Notifications</h3>
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-sm">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm">
            ✕
          </button>
        </div>
        {onMarkAllRead && unreadCount > 0 && (
          <button
            type="button"
            data-testid="mark-all-read"
            onClick={onMarkAllRead}
            className="text-primary btn btn-ghost btn-sm">
            Mark all as read
          </button>
        )}
        <ul className="flex-1 overflow-y-auto p-2">
          {notifications.length === 0 && (
            <li className="text-base-content/40 py-8 text-center text-sm">
              No notifications.
            </li>
          )}
          {notifications.map((notification) => (
            <li
              key={notification.id}
              data-testid={`notification-${notification.id}`}
              className={`hover:bg-base-200 flex flex-col gap-0.5 rounded-xl p-3 ${
                notification.unread ? 'bg-primary/5' : ''
              }`}>
              <span className="flex items-center gap-2">
                {notification.unread && (
                  <span className="bg-primary h-2 w-2 rounded-full" />
                )}
                <span className="text-sm font-medium">
                  {notification.title}
                </span>
                {notification.time && (
                  <span className="text-base-content/40 ml-auto text-xs">
                    {notification.time}
                  </span>
                )}
              </span>
              {notification.description && (
                <span className="text-base-content/60 text-sm">
                  {notification.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};
