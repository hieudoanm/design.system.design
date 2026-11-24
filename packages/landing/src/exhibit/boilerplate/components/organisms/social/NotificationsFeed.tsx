import type { FC } from 'react';

interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'mention';
  text: string;
  time: string;
  read: boolean;
}

interface NotificationsFeedProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
}

const TYPE_ICON: Record<Notification['type'], string> = {
  like: '❤',
  follow: '➕',
  comment: '💬',
  mention: '@',
};

export const NotificationsFeed: FC<NotificationsFeedProps> = ({
  notifications,
  onMarkRead,
}) => {
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <section data-testid="notifications-feed" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Notifications</h2>
        <span className="badge badge-primary">{unread} unread</span>
      </div>
      <ul className="menu bg-base-200 w-full gap-1 rounded-xl">
        {notifications.length === 0 && (
          <li className="text-base-content/60 text-center text-sm">
            No notifications yet
          </li>
        )}
        {notifications.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 ${
                item.read ? 'opacity-60' : 'bg-primary/10'
              }`}
              onClick={() => onMarkRead?.(item.id)}>
              <span className="badge badge-ghost" aria-hidden="true">
                {TYPE_ICON[item.type]}
              </span>
              <span className="flex-1 text-left">
                <span className="text-sm">{item.text}</span>
                <span className="text-base-content/50 block text-xs">
                  {item.time}
                </span>
              </span>
              {!item.read && (
                <span
                  className="badge badge-error size-2 rounded-full"
                  aria-label="unread"
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
