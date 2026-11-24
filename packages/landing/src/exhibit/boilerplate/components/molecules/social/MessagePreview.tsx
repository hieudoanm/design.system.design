import type { FC } from 'react';

interface MessagePreviewProps {
  name: string;
  preview: string;
  time?: string;
  unread?: number;
  avatar?: string;
}

export const MessagePreview: FC<MessagePreviewProps> = ({
  name,
  preview,
  time,
  unread = 0,
  avatar,
}) => (
  <div
    className="flex items-center gap-3 px-1 py-3"
    data-testid="message-preview">
    <div className="avatar placeholder">
      <div className="bg-primary text-primary-content w-10 rounded-full">
        <span>{avatar ?? name.charAt(0).toUpperCase()}</span>
      </div>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{name}</span>
        {time && (
          <time className="text-base-content/50 shrink-0 text-xs">{time}</time>
        )}
      </div>
      <p className="text-base-content/70 truncate text-sm">{preview}</p>
    </div>
    {unread > 0 && (
      <span className="badge badge-primary badge-sm">{unread}</span>
    )}
  </div>
);
