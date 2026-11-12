import { type FC } from 'react';
import {
  FaArrowLeft,
  FaBellSlash,
  FaCheckCircle,
  FaCog,
  FaImages,
  FaPencilAlt,
  FaPhone,
  FaSearch,
  FaUserPlus,
  FaUsers,
  FaVideo,
} from 'react-icons/fa';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import { IconButton } from '@/exhibit/components/chat/atoms/IconButton';
import { formatLastSeen } from '@/exhibit/lib/chat/format';

interface ChatHeaderProps {
  title: string;
  avatarColor: string;
  kind: 'direct' | 'group';
  online: boolean;
  lastSeenAt: number;
  memberCount?: number;
  muted: boolean;
  secret: boolean;
  lastSeenVisibility?: 'everyone' | 'contacts' | 'nobody';
  profilePhotoVisibility?: 'everyone' | 'contacts' | 'nobody';
  onNewChat: () => void;
  onBack?: () => void;
  onSearch?: () => void;
  onGroupAdmin?: () => void;
  onSettings?: () => void;
  onMediaGallery?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

export const ChatHeader: FC<ChatHeaderProps> = ({
  title,
  avatarColor,
  kind,
  online,
  lastSeenAt,
  memberCount,
  muted,
  secret,
  lastSeenVisibility = 'everyone',
  profilePhotoVisibility = 'everyone',
  onNewChat,
  onBack,
  onSearch,
  onGroupAdmin,
  onSettings,
  onMediaGallery,
  onVoiceCall,
  onVideoCall,
}: ChatHeaderProps) => {
  const showLastSeen = lastSeenVisibility === 'everyone';
  const showAvatar = profilePhotoVisibility === 'everyone';
  const subtitle =
    kind === 'group'
      ? `${memberCount ?? 0} members${secret ? ' · secret' : ''}`
      : showLastSeen
        ? formatLastSeen(online, lastSeenAt)
        : '';

  return (
    <header className="border-base-300 bg-base-100 flex items-center gap-3 border-b px-4 py-2.5">
      {onBack && (
        <IconButton
          icon={FaArrowLeft}
          label="Back"
          onClick={onBack}
          className="md:hidden"
        />
      )}
      {showAvatar && (
        <Avatar
          name={title}
          color={avatarColor}
          kind={kind === 'group' ? 'group' : 'user'}
          online={kind === 'direct' ? online : undefined}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-semibold">{title}</h2>
          {secret && (
            <FaCheckCircle
              aria-label="Secret chat"
              className="text-success h-4 w-4 shrink-0"
            />
          )}
          {muted && (
            <FaBellSlash
              aria-label="Muted"
              className="text-base-content/50 h-4 w-4 shrink-0"
            />
          )}
        </div>
        <p className="text-base-content/50 truncate text-xs">{subtitle}</p>
      </div>
      {onSearch && (
        <IconButton icon={FaSearch} label="Search" onClick={onSearch} />
      )}
      {onMediaGallery && (
        <IconButton icon={FaImages} label="Media" onClick={onMediaGallery} />
      )}
      {onVoiceCall && (
        <IconButton icon={FaPhone} label="Voice call" onClick={onVoiceCall} />
      )}
      {onVideoCall && (
        <IconButton icon={FaVideo} label="Video call" onClick={onVideoCall} />
      )}
      {onGroupAdmin && (
        <IconButton icon={FaUsers} label="Members" onClick={onGroupAdmin} />
      )}
      <IconButton icon={FaPencilAlt} label="Edit" />
      <IconButton icon={FaUserPlus} label="New chat" onClick={onNewChat} />
      {onSettings && (
        <IconButton icon={FaCog} label="Settings" onClick={onSettings} />
      )}
    </header>
  );
};
