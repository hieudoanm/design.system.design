import type { FC } from 'react';

interface NotificationItemProps {
  message: string;
  time?: string;
  type?: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  read?: boolean;
  avatar?: string;
}

const typeGlyph: Record<NonNullable<NotificationItemProps['type']>, string> = {
  like: '\u2665',
  comment: '\u270D',
  follow: '\u2192',
  mention: '@',
  system: '\u2022',
};

export const NotificationItem: FC<NotificationItemProps> = ({
  message,
  time,
  type = 'system',
  read = false,
  avatar,
}) => (
  <div
    className={`flex items-start gap-3 px-1 py-3 ${read ? '' : 'bg-primary/5 rounded-lg'}`}
    data-testid="notification-item">
    <div className="avatar placeholder">
      <div className="bg-neutral text-neutral-content w-10 rounded-full">
        <span>{avatar ?? typeGlyph[type]}</span>
      </div>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm">{message}</p>
      {time && <time className="text-base-content/50 text-xs">{time}</time>}
    </div>
    {!read && (
      <span className="badge badge-primary badge-xs mt-1" aria-label="Unread" />
    )}
  </div>
);
