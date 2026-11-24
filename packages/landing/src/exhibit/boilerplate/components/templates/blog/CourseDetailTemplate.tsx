'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiPlayCircle,
  FiStar,
  FiUsers,
} from 'react-icons/fi';

interface Module {
  id: string;
  title: string;
  lessons: string[];
}

interface Course {
  title: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  modules: Module[];
}

const COURSE: Course = {
  title: 'React Masterclass',
  instructor: 'Sarah Chen',
  rating: 4.8,
  students: 1240,
  duration: '6h 30m',
  modules: [
    {
      id: 'm1',
      title: 'Getting Started',
      lessons: ['React Setup', 'JSX Basics'],
    },
    {
      id: 'm2',
      title: 'Core Concepts',
      lessons: ['Props', 'State', 'Hooks'],
    },
    {
      id: 'm3',
      title: 'Advanced Patterns',
      lessons: ['Context API', 'Performance', 'Testing'],
    },
  ],
};

const TOTAL_LESSONS = COURSE.modules.reduce(
  (sum, module) => sum + module.lessons.length,
  0
);

export const CourseDetailTemplate: FC = () => {
  const [enrolled, setEnrolled] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['m1']);

  const toggleModule = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Course Details</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Course overview and curriculum.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{COURSE.title}</h3>
                <p className="text-base-content/50 mt-1 text-sm">
                  by {COURSE.instructor}
                </p>
              </div>
              {enrolled ? (
                <span className="badge badge-success badge-sm">Enrolled</span>
              ) : (
                <button
                  onClick={() => setEnrolled(true)}
                  className="btn btn-primary btn-sm">
                  Enroll
                </button>
              )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-base-content/50 flex items-center gap-1">
                <FiStar className="text-warning h-4 w-4" />
                {COURSE.rating} rating
              </span>
              <span className="text-base-content/50 flex items-center gap-1">
                <FiUsers className="h-4 w-4" />
                {COURSE.students.toLocaleString()} students
              </span>
              <span className="text-base-content/50 flex items-center gap-1">
                <FiClock className="h-4 w-4" />
                {COURSE.duration}
              </span>
              <span className="text-base-content/50 flex items-center gap-1">
                <FiPlayCircle className="h-4 w-4" />
                {TOTAL_LESSONS} lessons
              </span>
            </div>

            <div className="bg-base-300/50 rounded-xl p-4 text-sm">
              <p className="text-base-content/50 text-xs">Description</p>
              <p className="mt-1">
                Build production-ready applications with React, from components
                and state to advanced hooks and performance patterns.
              </p>
            </div>
          </div>
        </div>

        <h2 className="mb-3 text-base font-semibold">Curriculum</h2>
        <div className="flex flex-col gap-3">
          {COURSE.modules.map((module) => {
            const isOpen = expanded.includes(module.id);
            return (
              <div
                key={module.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{module.title}</h3>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="btn btn-ghost btn-sm gap-1">
                      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                      {isOpen ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  {isOpen && (
                    <ul className="text-base-content/50 mt-2 text-sm">
                      {module.lessons.map((lesson) => (
                        <li key={lesson} className="flex items-center gap-2">
                          <FiPlayCircle className="h-3 w-3" />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

CourseDetailTemplate.displayName = 'CourseDetailTemplate';
