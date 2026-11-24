import type { FC } from 'react';

interface Group {
  id: string;
  name: string;
  category: string;
  members: number;
  joined?: boolean;
}

interface GroupsHubProps {
  groups: Group[];
  onJoin?: (id: string) => void;
}

export const GroupsHub: FC<GroupsHubProps> = ({ groups, onJoin }) => {
  const joinedCount = groups.filter((group) => group.joined).length;

  return (
    <section data-testid="groups-hub" className="flex flex-col gap-4">
      <div className="stats w-full shadow">
        <div className="stat">
          <div className="stat-title">Total groups</div>
          <div className="stat-value text-lg">{groups.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Joined</div>
          <div className="stat-value text-lg" data-testid="joined-count">
            {joinedCount}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <article key={group.id} className="card bg-base-200">
            <div className="card-body gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="avatar placeholder">
                  <div className="bg-accent text-accent-content w-10 rounded-lg">
                    <span>{group.name.charAt(0)}</span>
                  </div>
                </div>
                <span className="badge badge-ghost">{group.category}</span>
              </div>
              <h3 className="text-sm font-medium">{group.name}</h3>
              <p className="text-base-content/50 text-xs">
                {group.members.toLocaleString()} members
              </p>
              <button
                type="button"
                className={`btn btn-sm ${
                  group.joined ? 'btn-outline' : 'btn-primary'
                }`}
                onClick={() => onJoin?.(group.id)}>
                {group.joined ? 'Joined' : 'Join'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
