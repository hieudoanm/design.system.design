import type { FC } from 'react';

interface AuthorBioProps {
  name: string;
  bio: string;
  avatar?: string;
  role?: string;
  socials?: { label: string; href: string }[];
}

export const AuthorBio: FC<AuthorBioProps> = ({
  name,
  bio,
  avatar,
  role,
  socials = [],
}) => (
  <aside
    data-testid="author-bio"
    className="card card-side bg-base-200 flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
    <div className="avatar">
      <div className="bg-primary text-primary-content w-20 rounded-full">
        {avatar ? (
          <img src={avatar} alt={name} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-bold">
            {name.charAt(0)}
          </span>
        )}
      </div>
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-medium">{name}</h3>
      {role && <p className="text-base-content/60 text-sm">{role}</p>}
      <p className="text-base-content/70 text-sm">{bio}</p>
      {socials.length > 0 && (
        <div className="mt-2 flex justify-center gap-2 sm:justify-start">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="btn btn-ghost btn-xs">
              {social.label}
            </a>
          ))}
        </div>
      )}
    </div>
  </aside>
);

AuthorBio.displayName = 'AuthorBio';
