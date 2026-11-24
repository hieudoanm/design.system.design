import type { FC, ReactNode } from 'react';
import { Avatar } from '../../atoms/developer/Avatar';

interface ProfileStat {
  label: string;
  value: string;
}

interface ProfileCardProps {
  name: string;
  role?: string;
  bio?: string;
  avatar?: { src?: string; alt: string; initials?: string };
  badges?: string[];
  stats?: ProfileStat[];
  actions?: ReactNode;
}

export const ProfileCard: FC<ProfileCardProps> = ({
  name,
  role,
  bio,
  avatar,
  badges = [],
  stats = [],
  actions,
}) => (
  <div className="card bg-base-200 border-base-content/10 border">
    <div className="card-body items-center text-center">
      <Avatar
        src={avatar?.src}
        alt={avatar?.alt ?? name}
        fallback={avatar?.initials}
        size="lg"
      />
      <div>
        <h3 className="card-title">{name}</h3>
        {role && <p className="text-primary text-sm">{role}</p>}
      </div>
      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {badges.map((badge) => (
            <span key={badge} className="badge badge-ghost badge-sm">
              {badge}
            </span>
          ))}
        </div>
      )}
      {bio && <p className="text-base-content/50 text-sm">{bio}</p>}
      {stats.length > 0 && (
        <div className="border-base-content/10 divide-base-content/10 mt-2 grid w-full grid-cols-3 divide-x rounded-lg border">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-2">
              <span className="text-sm font-semibold">{stat.value}</span>
              <span className="text-base-content/50 text-xs">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
      {actions && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {actions}
        </div>
      )}
    </div>
  </div>
);
