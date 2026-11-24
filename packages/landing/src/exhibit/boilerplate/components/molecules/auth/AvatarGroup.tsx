import type { FC } from 'react';
import { Avatar } from '../../atoms/developer/Avatar';

interface GroupAvatar {
  src?: string;
  alt: string;
  fallback?: string;
}

interface AvatarGroupProps {
  avatars: GroupAvatar[];
  size?: 'sm' | 'md' | 'lg';
  max?: number;
}

export const AvatarGroup: FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max,
}) => {
  const visible = max ? avatars.slice(0, max) : avatars;
  const overflow = max ? avatars.length - max : 0;

  return (
    <div className="flex -space-x-3">
      {visible.map((avatar) => (
        <div key={avatar.alt} className="border-base-100 rounded-full border-2">
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            fallback={avatar.fallback}
            size={size}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          aria-label={`${overflow} more members`}
          className="border-base-100 bg-base-300 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm">
          +{overflow}
        </div>
      )}
    </div>
  );
};
