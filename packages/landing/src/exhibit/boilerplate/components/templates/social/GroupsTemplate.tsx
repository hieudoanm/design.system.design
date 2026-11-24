'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiUsers } from 'react-icons/fi';

interface Group {
  id: string;
  name: string;
  members: number;
  joined: boolean;
}

const GROUPS: Group[] = [
  { id: 'g1', name: 'Next.js Developers', members: 12840, joined: true },
  { id: 'g2', name: 'Design Systems', members: 9213, joined: false },
  { id: 'g3', name: 'Rust Enthusiasts', members: 30512, joined: true },
  { id: 'g4', name: 'TypeScript Tips', members: 18734, joined: false },
  { id: 'g5', name: 'Startup Founders', members: 5412, joined: false },
  { id: 'g6', name: 'Accessibility Champions', members: 7689, joined: true },
];

export const GroupsTemplate: FC = () => {
  const [groups, setGroups] = useState<Group[]>(GROUPS);

  const joinedCount = groups.filter((group) => group.joined).length;

  const toggleJoin = (id: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id
          ? {
              ...group,
              joined: !group.joined,
              members: group.joined ? group.members - 1 : group.members + 1,
            }
          : group
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Join communities that share your interests.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {joinedCount} groups joined
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{group.name}</p>
                    <p className="text-base-content/50 mt-1 flex items-center gap-1 text-xs">
                      <FiUsers />
                      {group.members.toLocaleString()} members
                    </p>
                  </div>
                  <button
                    onClick={() => toggleJoin(group.id)}
                    className={`btn btn-sm ${
                      group.joined ? 'btn-outline' : 'btn-primary'
                    }`}>
                    {group.joined ? 'Leave' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

GroupsTemplate.displayName = 'GroupsTemplate';
