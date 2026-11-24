'use client';

import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { FiBell } from 'react-icons/fi';

interface Notification {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onOpen?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  unreadCount?: number;
}

export const NotificationCenter: FC<NotificationCenterProps> = ({
  notifications,
  onOpen,
  onMarkAllRead,
  unreadCount,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unread = unreadCount ?? notifications.filter((n) => n.unread).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="btn btn-ghost btn-circle">
        <div className="indicator">
          <FiBell className="h-5 w-5" />
          {unread > 0 && (
            <span className="badge badge-error badge-sm indicator-item">
              {unread}
            </span>
          )}
        </div>
      </button>
      {open && (
        <div
          role="dialog"
          className="border-base-content/10 bg-base-100 absolute top-full right-0 z-50 mt-2 w-80 rounded-xl border p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-sm font-medium">Notifications</p>
            {onMarkAllRead && unread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-primary btn btn-ghost btn-xs">
                Mark all read
              </button>
            )}
          </div>
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-base-content/40 px-2 py-4 text-center text-sm">
                No notifications
              </p>
            )}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => onOpen?.(notification)}
                className={`hover:bg-base-200 flex flex-col gap-0.5 rounded-xl px-3 py-2 text-left ${
                  notification.unread ? 'bg-base-200/60' : ''
                }`}>
                <span className="flex items-center gap-2">
                  {notification.unread && (
                    <span className="bg-primary h-1.5 w-1.5 rounded-full" />
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
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

NotificationCenter.displayName = 'NotificationCenter';
