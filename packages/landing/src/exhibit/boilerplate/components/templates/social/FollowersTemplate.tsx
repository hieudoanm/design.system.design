'use client';

import type { FC } from 'react';
import { useState } from 'react';

type FollowFilter = 'All' | 'Following';

interface Person {
  id: string;
  name: string;
  handle: string;
  following: boolean;
}

const PEOPLE: Person[] = [
  { id: 'f1', name: 'Jane Doe', handle: '@janedoe', following: true },
  { id: 'f2', name: 'Alex Chen', handle: '@alexchen', following: false },
  { id: 'f3', name: 'Sam Rivera', handle: '@samrivera', following: true },
  { id: 'f4', name: 'Priya Patel', handle: '@priyap', following: false },
  { id: 'f5', name: 'Marco Silva', handle: '@marcosilva', following: true },
  { id: 'f6', name: 'Nina Lopez', handle: '@ninalopez', following: false },
];

const FILTERS: FollowFilter[] = ['All', 'Following'];

export const FollowersTemplate: FC = () => {
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const [filter, setFilter] = useState<FollowFilter>('All');

  const followingCount = people.filter((person) => person.following).length;

  const visible = people.filter(
    (person) => filter === 'All' || person.following
  );

  const toggleFollow = (id: string) => {
    setPeople((prev) =>
      prev.map((person) =>
        person.id === id ? { ...person, following: !person.following } : person
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Followers</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Manage who you follow.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {followingCount} following
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {visible.map((person) => (
              <div
                key={person.id}
                className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {person.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-base-content/50 text-xs">
                    {person.handle}
                  </p>
                </div>
                <button
                  onClick={() => toggleFollow(person.id)}
                  className={`btn btn-sm ${
                    person.following ? 'btn-outline' : 'btn-primary'
                  }`}>
                  {person.following ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

FollowersTemplate.displayName = 'FollowersTemplate';
