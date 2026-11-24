'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface InviteTeamProps {
  onInvite: (payload: { email: string; role: string }) => void;
  roles?: string[];
  loading?: boolean;
}

export const InviteTeam: FC<InviteTeamProps> = ({
  onInvite,
  roles = ['Member', 'Admin', 'Viewer'],
  loading = false,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || email.trim() === '') return;
    onInvite({ email: email.trim(), role });
    setEmail('');
  };

  return (
    <form
      data-testid="invite-team-form"
      noValidate
      className="flex flex-col gap-4"
      onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">Invite teammates</h2>
        <p className="text-base-content/50 text-sm">
          They will receive an email to join your workspace.
        </p>
      </div>
      <label className="form-control w-full">
        <span className="label-text mb-1">Email address</span>
        <input
          type="email"
          value={email}
          placeholder="teammate@example.com"
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
      <label className="form-control w-full">
        <span className="label-text mb-1">Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="select select-bordered w-full">
          {roles.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        data-testid="invite-submit"
        className="btn btn-primary w-full"
        disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Sending invite…' : 'Send invite'}
      </button>
    </form>
  );
};
