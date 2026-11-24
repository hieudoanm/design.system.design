import type { FC } from 'react';

interface TeamMember {
  name: string;
  role: string;
  email: string;
}

interface TeamCardProps {
  name: string;
  members: TeamMember[];
  totalQuota?: number;
  currency?: string;
}

export const TeamCard: FC<TeamCardProps> = ({
  name,
  members,
  totalQuota,
  currency = '$',
}) => (
  <article data-testid="team-card" className="card bg-base-100 shadow-sm">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <h3 className="card-title">{name}</h3>
        {totalQuota !== undefined && (
          <span className="badge badge-primary badge-sm">
            {currency}
            {totalQuota.toLocaleString()}
          </span>
        )}
      </div>
      <ul className="divide-base-content/10 mt-2 divide-y">
        {members.map((member) => (
          <li key={member.email} className="flex items-center gap-3 py-2">
            <div className="avatar placeholder">
              <div className="bg-secondary text-secondary-content w-8 rounded-full">
                <span className="text-xs font-bold">
                  {member.name.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-base-content/50 text-xs">{member.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

TeamCard.displayName = 'TeamCard';
