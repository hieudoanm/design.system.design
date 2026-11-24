'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

type CourseStatus = 'In progress' | 'Completed';
type StatusFilter = 'All' | CourseStatus;

interface Course {
  id: string;
  title: string;
  progress: number;
  status: CourseStatus;
}

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'React Masterclass',
    progress: 65,
    status: 'In progress',
  },
  {
    id: 'c2',
    title: 'TypeScript Fundamentals',
    progress: 30,
    status: 'In progress',
  },
  {
    id: 'c3',
    title: 'UI Design Essentials',
    progress: 100,
    status: 'Completed',
  },
];

const FILTERS: StatusFilter[] = ['All', 'In progress', 'Completed'];

const getStatusBadge = (status: CourseStatus) => {
  if (status === 'Completed') {
    return <span className="badge badge-success badge-sm">Completed</span>;
  }
  return <span className="badge badge-info badge-sm">In progress</span>;
};

export const MyCoursesTemplate: FC = () => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [filter, setFilter] = useState<StatusFilter>('All');

  const visible = courses.filter(
    (course) => filter === 'All' || course.status === filter
  );

  const inProgressCount = courses.filter(
    (course) => course.status === 'In progress'
  ).length;

  const continueCourse = (id: string) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== id) {
          return course;
        }
        const next = Math.min(100, course.progress + 10);
        return {
          ...course,
          progress: next,
          status: next >= 100 ? 'Completed' : 'In progress',
        };
      })
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Courses you are taking.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiBookOpen />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">In progress</p>
              <p className="text-2xl font-bold tracking-tight">
                {inProgressCount} courses in progress
              </p>
            </div>
          </div>
        </div>

        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`tab ${filter === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No courses found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visible.map((course) => (
              <div
                key={course.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {course.status === 'Completed' ? (
                        <FiCheckCircle className="text-success h-4 w-4" />
                      ) : (
                        <FiClock className="text-info h-4 w-4" />
                      )}
                      <h3 className="text-sm font-semibold">{course.title}</h3>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <progress
                      className="progress progress-primary w-full"
                      value={course.progress}
                      max={100}
                      aria-label={`Progress for ${course.title}`}
                    />
                    <span className="text-sm font-bold">
                      {course.progress}%
                    </span>
                  </div>
                  {course.status === 'In progress' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => continueCourse(course.id)}
                        className="btn btn-primary btn-sm gap-1">
                        Continue
                        <FiArrowRight />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

MyCoursesTemplate.displayName = 'MyCoursesTemplate';
