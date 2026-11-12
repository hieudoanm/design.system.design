import { type FC } from 'react';
import { FaBellSlash, FaHashtag } from 'react-icons/fa';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import { Badge } from '@/exhibit/components/chat/atoms/Badge';
import { formatRelativeTime } from '@/exhibit/lib/chat/format';

interface ChatListItemProps {
  id: string;
  title: string;
  avatarColor: string;
  kind: 'direct' | 'group';
  online: boolean;
  preview: string;
  lastMessageAt: number;
  unreadCount: number;
  muted: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const ChatListItem: FC<ChatListItemProps> = ({
  id,
  title,
  avatarColor,
  kind,
  online,
  preview,
  lastMessageAt,
  unreadCount,
  muted,
  selected,
  onSelect,
}) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    aria-current={selected}
    aria-label={`Open chat with ${title}`}
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
      selected ? 'bg-primary/15' : 'hover:bg-base-200'
    }`}>
    <div className="relative">
      <Avatar
        name={title}
        color={avatarColor}
        kind={kind === 'group' ? 'group' : 'user'}
        online={kind === 'direct' ? online : undefined}
      />
      {kind === 'group' && (
        <FaHashtag
          aria-hidden="true"
          className="bg-primary absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full p-0.5 text-white"
        />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-semibold">{title}</span>
        <span className="text-base-content/50 shrink-0 text-xs">
          {formatRelativeTime(lastMessageAt)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-base-content/60 truncate text-sm">
          {muted && (
            <FaBellSlash aria-label="Muted" className="mr-1 inline h-3 w-3" />
          )}
          {preview || 'No messages yet'}
        </span>
        <Badge count={unreadCount} muted={muted} />
      </div>
    </div>
  </button>
);
