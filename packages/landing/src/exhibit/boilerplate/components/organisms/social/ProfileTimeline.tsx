import type { FC } from 'react';

interface Activity {
  id: string;
  type: 'post' | 'reaction' | 'share' | 'event';
  title: string;
  time: string;
}

interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

interface ProfileTimelineProps {
  name: string;
  handle: string;
  bio?: string;
  stats: ProfileStats;
  activities: Activity[];
}

const TYPE_LABEL: Record<Activity['type'], string> = {
  post: 'Posted',
  reaction: 'Reacted',
  share: 'Shared',
  event: 'Attended',
};

const TYPE_CLASS: Record<Activity['type'], string> = {
  post: 'badge-primary',
  reaction: 'badge-secondary',
  share: 'badge-accent',
  event: 'badge-info',
};

export const ProfileTimeline: FC<ProfileTimelineProps> = ({
  name,
  handle,
  bio,
  stats,
  activities,
}) => {
  return (
    <div data-testid="profile-timeline" className="flex flex-col gap-4">
      <section className="card bg-base-200">
        <div className="card-body gap-4">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content w-16 rounded-full">
                <span className="text-2xl">{name.charAt(0)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-medium">{name}</h2>
              <p className="text-base-content/50 text-sm">{handle}</p>
            </div>
          </div>
          {bio && <p>{bio}</p>}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="stat">
              <div className="stat-value text-lg">{stats.posts}</div>
              <div className="stat-title">Posts</div>
            </div>
            <div className="stat">
              <div className="stat-value text-lg">{stats.followers}</div>
              <div className="stat-title">Followers</div>
            </div>
            <div className="stat">
              <div className="stat-value text-lg">{stats.following}</div>
              <div className="stat-title">Following</div>
            </div>
          </div>
        </div>
      </section>

      <ul className="timeline timeline-vertical">
        {activities.map((activity) => (
          <li key={activity.id}>
            <div className="timeline-middle">
              <span className="badge badge-ghost">&#9679;</span>
            </div>
            <div className="timeline-start mb-10 md:text-end">
              <div className={`badge ${TYPE_CLASS[activity.type]}`}>
                {TYPE_LABEL[activity.type]}
              </div>
              <h3 className="mt-1 text-sm font-medium">{activity.title}</h3>
              <p className="text-base-content/50 text-xs">{activity.time}</p>
            </div>
            <hr className="bg-primary" />
          </li>
        ))}
      </ul>
    </div>
  );
};
