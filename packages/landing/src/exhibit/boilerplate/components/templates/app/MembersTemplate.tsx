'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiUserPlus, FiX } from 'react-icons/fi';

type MemberRole = 'Admin' | 'Member' | 'Viewer';
type MemberStatus = 'Active' | 'Pending' | 'Invited';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    name: 'Alice Chen',
    email: 'alice@acme.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 'm2',
    name: 'Bob Martinez',
    email: 'bob@acme.com',
    role: 'Member',
    status: 'Active',
  },
  {
    id: 'm3',
    name: 'Carol Smith',
    email: 'carol@acme.com',
    role: 'Viewer',
    status: 'Pending',
  },
];

const ROLE_OPTIONS: MemberRole[] = ['Admin', 'Member', 'Viewer'];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

const getStatusBadge = (status: MemberStatus) => {
  switch (status) {
    case 'Active':
      return <span className="badge badge-success badge-sm">Active</span>;
    case 'Pending':
      return <span className="badge badge-warning badge-sm">Pending</span>;
    default:
      return <span className="badge badge-neutral badge-sm">Invited</span>;
  }
};

export const MembersTemplate: FC = () => {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const updateRole = (id: string, role: MemberRole) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const sendInvite = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        name: inviteName || 'New Member',
        email: inviteEmail || 'member@acme.com',
        role: 'Member',
        status: 'Invited',
      },
    ]);
    setInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Team members</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Manage who has access to your workspace.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setInviteOpen(true)}
            className="btn btn-primary btn-sm">
            <FiUserPlus />
            Invite member
          </button>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-base-300 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-base-content/40 text-xs">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateRole(member.id, e.target.value as MemberRole)
                          }
                          className="select select-bordered select-sm">
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(member.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeMember(member.id)}
                          className="btn btn-ghost btn-sm text-base-content/50 hover:text-error">
                          <FiX />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {inviteOpen && (
          <dialog open className="modal modal-open">
            <div className="modal-box">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Invite member</h3>
                <button
                  onClick={() => setInviteOpen(false)}
                  title="Close"
                  className="btn btn-ghost btn-sm btn-square">
                  <FiX />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="invite-name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="invite-name"
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="invite-email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div className="modal-action">
                <button onClick={sendInvite} className="btn btn-primary btn-sm">
                  Send invite
                </button>
              </div>
            </div>
          </dialog>
        )}
      </main>
    </div>
  );
};

MembersTemplate.displayName = 'MembersTemplate';
