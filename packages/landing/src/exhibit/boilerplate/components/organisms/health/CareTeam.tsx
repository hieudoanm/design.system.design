import type { FC } from 'react';

interface CareMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
}

interface CareTeamProps {
  members: CareMember[];
  title?: string;
}

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const CareTeam: FC<CareTeamProps> = ({
  members,
  title = 'Care team',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body">
      <h3 className="card-title">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <article
            key={member.id}
            className="bg-base-100 border-base-content/10 flex items-center gap-3 rounded-xl border p-4">
            <div className="avatar">
              <div className="bg-primary text-primary-content flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium">
                {initials(member.name)}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{member.name}</span>
              <span className="text-base-content/50 text-xs">
                {member.role}
              </span>
              {member.specialty && (
                <span className="badge badge-ghost badge-sm mt-1 w-fit">
                  {member.specialty}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
      {members.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No care team members.
        </p>
      )}
    </div>
  </section>
);
