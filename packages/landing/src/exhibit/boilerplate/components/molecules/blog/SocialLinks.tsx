import type { FC, ReactNode } from 'react';
import {
  FiFacebook,
  FiGithub,
  FiGlobe,
  FiInstagram,
  FiLinkedin,
  FiTwitter,
  FiYoutube,
} from 'react-icons/fi';

type SocialPlatform =
  | 'github'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'globe';

interface SocialLinkItem {
  platform: SocialPlatform;
  href: string;
  label?: string;
}

interface SocialLinksProps {
  items: SocialLinkItem[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<SocialPlatform, ReactNode> = {
  github: <FiGithub />,
  twitter: <FiTwitter />,
  linkedin: <FiLinkedin />,
  instagram: <FiInstagram />,
  youtube: <FiYoutube />,
  facebook: <FiFacebook />,
  globe: <FiGlobe />,
};

const sizeClass: Record<NonNullable<SocialLinksProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4.5 w-4.5',
  lg: 'h-5 w-5',
};

export const SocialLinks: FC<SocialLinksProps> = ({
  items,
  size = 'md',
  className = '',
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {items.map((item) => (
      <a
        key={item.platform}
        href={item.href}
        aria-label={item.label ?? item.platform}
        className="border-base-content/15 btn btn-ghost btn-circle btn-sm hover:bg-base-200">
        <span className={sizeClass[size]}>{iconMap[item.platform]}</span>
      </a>
    ))}
  </div>
);

SocialLinks.displayName = 'SocialLinks';
