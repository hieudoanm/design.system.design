'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface Lesson {
  id: string;
  title: string;
  duration?: string;
  completed?: boolean;
}

interface LessonNavigationProps {
  lessons: Lesson[];
  activeLesson?: string;
  onSelect?: (lessonId: string) => void;
}

export const LessonNavigation: FC<LessonNavigationProps> = ({
  lessons,
  activeLesson,
  onSelect,
}) => {
  const [activeId, setActiveId] = useState(
    activeLesson ?? lessons[0]?.id ?? ''
  );

  const currentIndex = lessons.findIndex((lesson) => lesson.id === activeId);
  const current = lessons[currentIndex];

  const select = (lessonId: string) => {
    setActiveId(lessonId);
    onSelect?.(lessonId);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <nav aria-label="Lesson list" className="md:col-span-1">
        <ol className="bg-base-200 flex flex-col gap-1 rounded-xl p-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <button
                data-testid="lesson-item"
                className={`btn btn-sm w-full justify-start ${
                  lesson.id === activeId ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => select(lesson.id)}>
                <span className="font-mono text-xs">{index + 1}</span>
                <span className="flex-1 truncate text-left">
                  {lesson.title}
                </span>
                {lesson.completed && <span aria-label="Completed">✓</span>}
                {lesson.duration && (
                  <span className="text-base-content/40 text-xs">
                    {lesson.duration}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="md:col-span-2">
        {current ? (
          <article className="card bg-base-200 border-base-content/10 rounded-xl border">
            <div className="card-body">
              <h2 className="text-xl">
                {currentIndex + 1}. {current.title}
              </h2>
              <p className="text-base-content/50 text-sm">
                {current.duration ?? 'No duration set'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <button
                  data-testid="lesson-prev"
                  className="btn btn-outline btn-sm"
                  disabled={currentIndex <= 0}
                  onClick={() => select(lessons[currentIndex - 1].id)}>
                  ← Previous
                </button>
                <button
                  data-testid="lesson-next"
                  className="btn btn-primary btn-sm"
                  disabled={currentIndex >= lessons.length - 1}
                  onClick={() => select(lessons[currentIndex + 1].id)}>
                  Next →
                </button>
              </div>
            </div>
          </article>
        ) : (
          <p className="text-base-content/50">No lesson selected.</p>
        )}
      </div>
    </div>
  );
};
