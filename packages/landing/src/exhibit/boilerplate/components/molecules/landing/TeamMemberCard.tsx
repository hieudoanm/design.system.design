import type { FC } from 'react';

interface SocialLink {
  label: string;
  href: string;
}

interface TeamMemberCardProps {
  name: string;
  role: string;
  bio?: string;
  initials?: string;
  socials?: SocialLink[];
  className?: string;
}

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const TeamMemberCard: FC<TeamMemberCardProps> = ({
  name,
  role,
  bio,
  initials,
  socials = [],
  className = '',
}) => {
  const fallback = initials ?? initialsOf(name);

  return (
    <article
      data-testid="team-member-card"
      className={`card bg-base-200 border-base-content/10 items-center border p-6 text-center ${className}`}>
      <span className="bg-primary text-primary-content flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold">
        {fallback}
      </span>
      <h3 className="mt-3 text-base font-medium">{name}</h3>
      <p className="text-base-content/50 text-sm">{role}</p>
      {bio && (
        <p className="text-base-content/70 mt-2 text-sm leading-relaxed">
          {bio}
        </p>
      )}
      {socials.length > 0 && (
        <div className="mt-4 flex gap-2">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="btn btn-outline btn-sm"
              aria-label={social.label}>
              {social.label}
            </a>
          ))}
        </div>
      )}
    </article>
  );
};
