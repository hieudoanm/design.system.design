'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBookOpen, FiClock, FiPlayCircle } from 'react-icons/fi';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type Category = 'Development' | 'Design' | 'Marketing';
type CategoryFilter = 'All' | Category;

interface Course {
  id: string;
  title: string;
  category: Category;
  level: Level;
  duration: string;
  lessons: number;
}

const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'React Masterclass',
    category: 'Development',
    level: 'Intermediate',
    duration: '6h 30m',
    lessons: 12,
  },
  {
    id: 'c2',
    title: 'TypeScript Fundamentals',
    category: 'Development',
    level: 'Beginner',
    duration: '4h 15m',
    lessons: 10,
  },
  {
    id: 'c3',
    title: 'UI Design Essentials',
    category: 'Design',
    level: 'Beginner',
    duration: '5h 45m',
    lessons: 14,
  },
  {
    id: 'c4',
    title: 'Figma Advanced',
    category: 'Design',
    level: 'Advanced',
    duration: '3h 20m',
    lessons: 8,
  },
  {
    id: 'c5',
    title: 'Growth Marketing',
    category: 'Marketing',
    level: 'Intermediate',
    duration: '7h 10m',
    lessons: 16,
  },
  {
    id: 'c6',
    title: 'SEO Crash Course',
    category: 'Marketing',
    level: 'Beginner',
    duration: '2h 30m',
    lessons: 6,
  },
];

const FILTERS: CategoryFilter[] = ['All', 'Development', 'Design', 'Marketing'];

export const CourseCatalogTemplate: FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('All');

  const query = search.trim().toLowerCase();

  const visible = COURSES.filter((course) => {
    const matchesCategory = filter === 'All' || course.category === filter;
    const matchesQuery =
      query === '' || course.title.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Browse all available courses.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiBookOpen />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Catalog</p>
              <p className="text-2xl font-bold tracking-tight">
                {visible.length} courses
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
            className="input input-bordered input-sm w-full sm:max-w-xs"
          />
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
        </div>

        {visible.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No courses found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((course) => (
              <div
                key={course.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">{course.title}</h3>
                    <span className="badge badge-ghost badge-sm">
                      {course.category}
                    </span>
                  </div>
                  <div className="mb-4 flex items-center gap-3 text-xs">
                    <span className="badge badge-info badge-sm">
                      {course.level}
                    </span>
                    <span className="text-base-content/50 flex items-center gap-1">
                      <FiClock className="h-3 w-3" />
                      {course.duration}
                    </span>
                    <span className="text-base-content/50 flex items-center gap-1">
                      <FiPlayCircle className="h-3 w-3" />
                      {course.lessons} lessons
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

CourseCatalogTemplate.displayName = 'CourseCatalogTemplate';
