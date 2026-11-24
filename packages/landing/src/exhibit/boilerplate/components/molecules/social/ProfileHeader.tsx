import type { FC } from 'react';

interface ProfileHeaderProps {
  name: string;
  handle?: string;
  bio?: string;
  followers?: number;
  following?: number;
  avatar?: string;
  isVerified?: boolean;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({
  name,
  handle,
  bio,
  followers = 0,
  following = 0,
  avatar,
  isVerified = false,
}) => (
  <header
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="profile-header">
    <div className="card-body gap-4">
      <div className="flex items-center gap-4">
        <div className="avatar placeholder">
          <div className="bg-accent text-accent-content w-20 rounded-full">
            <span className="text-2xl">
              {avatar ?? name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="card-title flex-wrap">
            {name}
            {isVerified && (
              <svg
                aria-label="Verified"
                viewBox="0 0 24 24"
                className="fill-primary h-5 w-5">
                <path d="M12 2l2.4 2.4 3.3-.4 1 3.2 3.1 1.3-1.4 3 1.4 3-3.1 1.3-1 3.2-3.3-.4L12 22l-2.4-2.4-3.3.4-1-3.2-3.1-1.3 1.4-3-1.4-3 3.1-1.3 1-3.2 3.3.4z" />
              </svg>
            )}
          </h2>
          {handle && <p className="text-base-content/50 text-sm">@{handle}</p>}
        </div>
      </div>
      {bio && <p className="text-sm">{bio}</p>}
      <dl className="flex gap-6 text-sm">
        <div>
          <dt className="text-base-content/50">Followers</dt>
          <dd className="font-semibold">{followers}</dd>
        </div>
        <div>
          <dt className="text-base-content/50">Following</dt>
          <dd className="font-semibold">{following}</dd>
        </div>
      </dl>
    </div>
  </header>
);
