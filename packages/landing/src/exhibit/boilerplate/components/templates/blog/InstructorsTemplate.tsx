'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBookOpen, FiStar, FiUsers } from 'react-icons/fi';

interface Instructor {
  id: string;
  name: string;
  role: string;
  courses: number;
  rating: number;
  students: number;
}

const INSTRUCTORS: Instructor[] = [
  {
    id: 'i1',
    name: 'Sarah Chen',
    role: 'Senior Frontend Engineer',
    courses: 5,
    rating: 4.9,
    students: 8200,
  },
  {
    id: 'i2',
    name: 'David Kim',
    role: 'Full-Stack Developer',
    courses: 3,
    rating: 4.8,
    students: 5400,
  },
  {
    id: 'i3',
    name: 'Maya Patel',
    role: 'Product Designer',
    courses: 4,
    rating: 4.7,
    students: 3100,
  },
  {
    id: 'i4',
    name: 'Omar Hassan',
    role: 'Growth Marketing Lead',
    courses: 2,
    rating: 4.9,
    students: 1900,
  },
];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

export const InstructorsTemplate: FC = () => {
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();

  const visible = INSTRUCTORS.filter((instructor) =>
    instructor.name.toLowerCase().includes(query)
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Instructors</h1>
        <p className="text-base-content/50 mt-1 text-sm">Meet your teachers.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiUsers />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Faculty</p>
              <p className="text-2xl font-bold tracking-tight">
                {visible.length} instructors
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instructors..."
            aria-label="Search instructors"
            className="input input-bordered input-sm w-full sm:max-w-xs"
          />
        </div>

        {visible.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No instructors found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((instructor) => (
              <div
                key={instructor.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {getInitials(instructor.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {instructor.name}
                      </p>
                      <p className="text-base-content/50 truncate text-xs">
                        {instructor.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-base-content/50 flex items-center gap-1">
                      <FiBookOpen className="h-3 w-3" />
                      {instructor.courses} courses
                    </span>
                    <span className="text-base-content/50 flex items-center gap-1">
                      <FiStar className="text-warning h-3 w-3" />
                      {instructor.rating} rating
                    </span>
                    <span className="text-base-content/50 flex items-center gap-1">
                      <FiUsers className="h-3 w-3" />
                      {instructor.students.toLocaleString()} students
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

InstructorsTemplate.displayName = 'InstructorsTemplate';
