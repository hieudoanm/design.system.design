import {
  FiBell,
  FiCalendar,
  FiCheck,
  FiHeart,
  FiHome,
  FiLock,
  FiMail,
  FiSearch,
  FiStar,
  FiUser,
} from 'react-icons/fi';
import type { FC } from 'react';

type IconName =
  | 'bell'
  | 'calendar'
  | 'check'
  | 'heart'
  | 'home'
  | 'lock'
  | 'mail'
  | 'search'
  | 'star'
  | 'user';

const iconMap: Record<IconName, FC<{ className?: string }>> = {
  bell: FiBell,
  calendar: FiCalendar,
  check: FiCheck,
  heart: FiHeart,
  home: FiHome,
  lock: FiLock,
  mail: FiMail,
  search: FiSearch,
  star: FiStar,
  user: FiUser,
};

interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass: Record<NonNullable<IconProps['size']>, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const Icon: FC<IconProps> = ({ name, size = 'md', className = '' }) => {
  const Glyph = iconMap[name];
  return <Glyph className={`${sizeClass[size]} ${className}`} />;
};
