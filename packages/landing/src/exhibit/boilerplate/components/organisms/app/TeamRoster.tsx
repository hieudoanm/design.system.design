'use client';

import type { FC } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: 'active' | 'invited' | 'suspended';
}

interface TeamRosterProps {
  members: Member[];
  onInvite?: () => void;
}

const STATUS_BADGE: Record<NonNullable<Member['status']>, string> = {
  active: 'badge-success',
  invited: 'badge-warning',
  suspended: 'badge-error',
};

export const TeamRoster: FC<TeamRosterProps> = ({ members, onInvite }) => (
  <section className="card bg-base-100 border-base-200 border shadow-sm">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">Team</h3>
        {onInvite && (
          <button
            type="button"
            data-testid="invite-member"
            className="btn btn-primary btn-sm"
            onClick={onInvite}>
            Invite member
          </button>
        )}
      </div>
      {members.length === 0 ? (
        <p
          data-testid="roster-empty"
          className="text-base-content/40 py-4 text-center text-sm">
          No team members yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-zebra table-sm table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} data-testid={`member-${member.id}`}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-base-content/50 text-xs">
                        {member.email}
                      </span>
                    </div>
                  </td>
                  <td>{member.role}</td>
                  <td>
                    {member.status && (
                      <span
                        className={`badge badge-sm ${STATUS_BADGE[member.status]}`}>
                        {member.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </section>
);
