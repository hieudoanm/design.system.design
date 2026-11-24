import type { FC } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

const sizeClass: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
};

export const Avatar: FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  fallback,
}) => {
  const initials =
    fallback ??
    alt
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  if (!src) {
    return (
      <div className={`avatar placeholder ${sizeClass[size]}`}>
        <div className="bg-base-content/10 text-base-content rounded-full">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className={`avatar ${sizeClass[size]}`}>
      <img src={src} alt={alt} />
    </div>
  );
};
