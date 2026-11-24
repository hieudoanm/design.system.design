'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiPlayCircle,
  FiVideo,
} from 'react-icons/fi';

interface Lesson {
  id: string;
  title: string;
}

const COURSE_NAME = 'React Masterclass';

const LESSONS: Lesson[] = [
  { id: 'l1', title: 'JSX Basics' },
  { id: 'l2', title: 'Components Overview' },
  { id: 'l3', title: 'Props and State' },
  { id: 'l4', title: 'Hooks Intro' },
  { id: 'l5', title: 'Effects' },
];

const CURRENT_INDEX = 2;
const DURATION = '12:30';

type LessonStatus = 'Current lesson' | 'Completed' | 'Upcoming';

const getStatusBadge = (status: LessonStatus) => {
  if (status === 'Current lesson') {
    return <span className="badge badge-info badge-sm">Current lesson</span>;
  }
  if (status === 'Completed') {
    return <span className="badge badge-success badge-sm">Completed</span>;
  }
  return <span className="badge badge-neutral badge-sm">Upcoming</span>;
};

export const LessonPlayerTemplate: FC = () => {
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentLesson = LESSONS[CURRENT_INDEX];

  const nextIndex = completed ? CURRENT_INDEX + 1 : CURRENT_INDEX;
  const nextLesson = completed ? LESSONS[nextIndex] : undefined;

  const lessonStatus = (index: number): LessonStatus => {
    if (index < CURRENT_INDEX) {
      return 'Completed';
    }
    if (completed && index === CURRENT_INDEX) {
      return 'Completed';
    }
    if (index === nextIndex) {
      return 'Current lesson';
    }
    return 'Upcoming';
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Lesson Player</h1>
        <p className="text-base-content/50 mt-1 text-sm">Watch and learn.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-6">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{currentLesson.title}</h3>
                <p className="text-base-content/50 mt-1 text-sm">
                  {COURSE_NAME}
                </p>
              </div>
              {completed && (
                <span className="badge badge-success badge-sm">Completed</span>
              )}
            </div>

            <div className="bg-base-300/50 flex aspect-video w-full items-center justify-center rounded-xl">
              <FiVideo className="text-base-content/30 h-12 w-12" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="text-base-content/50 flex items-center gap-1 text-sm">
                <FiClock className="h-4 w-4" />
                {DURATION}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaying((prev) => !prev)}
                  className="btn btn-primary btn-sm gap-1">
                  <FiPlayCircle />
                  {playing ? 'Pause' : 'Play'}
                </button>
                {completed ? (
                  <span className="badge badge-success badge-sm">
                    Marked complete
                  </span>
                ) : (
                  <button
                    onClick={() => setCompleted(true)}
                    className="btn btn-ghost btn-sm gap-1">
                    <FiCheckCircle />
                    Mark complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-3 text-base font-semibold">Lessons</h2>
        <div className="flex flex-col gap-3">
          {LESSONS.map((lesson, index) => (
            <div
              key={lesson.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex-row items-center justify-between gap-2 p-4">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-base-content/50 h-4 w-4" />
                  <p className="text-sm font-medium">{lesson.title}</p>
                </div>
                {getStatusBadge(lessonStatus(index))}
              </div>
            </div>
          ))}
        </div>

        {completed && nextLesson && (
          <div className="bg-primary/10 text-primary mt-4 rounded-xl p-4 text-sm">
            Up next: {nextLesson.title}
          </div>
        )}
      </main>
    </div>
  );
};

LessonPlayerTemplate.displayName = 'LessonPlayerTemplate';
