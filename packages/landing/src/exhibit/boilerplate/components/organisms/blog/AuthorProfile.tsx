import type { FC } from 'react';

interface AuthorProfileProps {
  name: string;
  role: string;
  bio?: string;
  initials?: string;
  stats?: {
    articles?: number;
    followers?: number;
    following?: number;
  };
}

export const AuthorProfile: FC<AuthorProfileProps> = ({
  name,
  role,
  bio,
  initials,
  stats,
}) => (
  <aside className="card bg-base-200 border-base-content/10 rounded-xl border">
    <div className="card-body items-center text-center">
      <div className="avatar placeholder">
        <div className="bg-primary text-primary-content size-16 rounded-full">
          <span className="text-xl">{initials ?? name.charAt(0)}</span>
        </div>
      </div>
      <h3 className="card-title">{name}</h3>
      <p className="text-base-content/50 text-sm">{role}</p>
      {bio && <p className="text-base-content/60 text-sm">{bio}</p>}
      {stats && (
        <dl className="mt-2 grid w-full grid-cols-3 gap-2">
          <div className="stat py-2">
            <dt className="text-base-content/40 text-xs">Articles</dt>
            <dd className="text-lg font-medium">{stats.articles ?? 0}</dd>
          </div>
          <div className="stat py-2">
            <dt className="text-base-content/40 text-xs">Followers</dt>
            <dd className="text-lg font-medium">{stats.followers ?? 0}</dd>
          </div>
          <div className="stat py-2">
            <dt className="text-base-content/40 text-xs">Following</dt>
            <dd className="text-lg font-medium">{stats.following ?? 0}</dd>
          </div>
        </dl>
      )}
    </div>
  </aside>
);
