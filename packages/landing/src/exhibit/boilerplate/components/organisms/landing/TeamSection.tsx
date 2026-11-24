import type { FC } from 'react';

interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  initials?: string;
}

interface TeamSectionProps {
  members: TeamMember[];
  title?: string;
}

export const TeamSection: FC<TeamSectionProps> = ({
  members,
  title = 'Our team',
}) => (
  <section className="py-10">
    <h2 className="mb-6 text-center text-2xl">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => (
        <div
          key={member.name}
          className="card bg-base-200 border-base-content/10 flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content w-16 rounded-full">
              <span className="text-lg">
                {member.initials ?? member.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium">{member.name}</h4>
            {member.role && (
              <p className="text-primary text-xs">{member.role}</p>
            )}
          </div>
          {member.bio && (
            <p className="text-base-content/50 text-xs">{member.bio}</p>
          )}
        </div>
      ))}
    </div>
  </section>
);
