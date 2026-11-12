import { type FC } from 'react';
import { FaUsers } from 'react-icons/fa';
import { getInitials } from '@/exhibit/lib/chat/format';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

interface AvatarProps {
  name: string;
  color: string;
  kind?: 'user' | 'group';
  online?: boolean;
  size?: AvatarSize;
}

export const Avatar: FC<AvatarProps> = ({
  name,
  color,
  kind = 'user',
  online,
  size = 'md',
}) => {
  const showStatus = online !== undefined;
  return (
    <div className={`avatar ${showStatus ? 'placeholder' : ''}`}>
      <div
        className={`flex items-center justify-center rounded-full font-bold text-white ${SIZE_CLASSES[size]}`}
        style={{ backgroundColor: color }}
        aria-label={`${name} avatar`}>
        {kind === 'group' ? <FaUsers aria-hidden="true" /> : getInitials(name)}
      </div>
      {showStatus && (
        <span
          className={`border-base-100 absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 ${
            online ? 'bg-success' : 'bg-neutral'
          }`}
          aria-label={online ? 'online' : 'offline'}
        />
      )}
    </div>
  );
};
