'use client';

import { type FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { EmptyState } from '@/exhibit/components/pos/atoms';
import { FormCard, PanelHeader } from '@/exhibit/components/pos/molecules';
import type { User } from '@/exhibit/types/pos';

const ROLE_COLORS: Record<User['role'], string> = {
  admin: 'badge-primary',
  manager: 'badge-secondary',
  cashier: 'badge-ghost',
};

interface UserManagerProps {
  users: User[];
  currentUser: User | null;
  onAdd: (user: User) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}

export const UserManager: FC<UserManagerProps> = ({
  users,
  currentUser,
  onAdd,
  onRemove,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('cashier');
  const [pin, setPin] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !pin.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      role,
      pin: pin.trim(),
      active: true,
    });
    setName('');
    setPin('');
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Users" onBack={onBack} />

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <FormCard title="New User">
          <input
            type="text"
            className="input input-bordered input-sm"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="select select-bordered select-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as User['role'])}>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="password"
            className="input input-bordered input-sm"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={6}
          />
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            <FiPlus className="size-4" /> Add User
          </button>
        </FormCard>

        <h2 className="mb-2 text-sm font-semibold">Users ({users.length})</h2>
        {users.length === 0 ? (
          <EmptyState>No users configured</EmptyState>
        ) : (
          <ul className="divide-base-300 divide-y">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{u.name}</p>
                  <span className={`badge badge-xs ${ROLE_COLORS[u.role]}`}>
                    {u.role}
                  </span>
                  {currentUser?.id === u.id && (
                    <span className="badge badge-success badge-xs">You</span>
                  )}
                </div>
                {currentUser?.role === 'admin' && currentUser.id !== u.id && (
                  <button
                    aria-label={`Remove ${u.name}`}
                    className="btn btn-ghost btn-xs"
                    onClick={() => onRemove(u.id)}>
                    <FiTrash2 className="size-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
