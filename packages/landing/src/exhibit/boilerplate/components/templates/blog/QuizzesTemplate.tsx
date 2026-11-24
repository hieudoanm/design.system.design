'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAward, FiFileText, FiZap } from 'react-icons/fi';

type QuizStatus = 'Not taken' | 'Passed' | 'Failed';

interface Quiz {
  id: string;
  title: string;
  module: string;
  questions: number;
  score: number;
  status: QuizStatus;
}

const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    title: 'React Hooks Quiz',
    module: 'React Masterclass',
    questions: 10,
    score: 80,
    status: 'Passed',
  },
  {
    id: 'q2',
    title: 'TypeScript Types Quiz',
    module: 'TypeScript Fundamentals',
    questions: 8,
    score: 0,
    status: 'Not taken',
  },
  {
    id: 'q3',
    title: 'JSX Deep Dive',
    module: 'React Masterclass',
    questions: 12,
    score: 90,
    status: 'Passed',
  },
  {
    id: 'q4',
    title: 'Design Tokens Quiz',
    module: 'UI Design Essentials',
    questions: 6,
    score: 55,
    status: 'Failed',
  },
];

const getStatusBadge = (status: QuizStatus) => {
  if (status === 'Passed') {
    return <span className="badge badge-success badge-sm">Passed</span>;
  }
  if (status === 'Failed') {
    return <span className="badge badge-error badge-sm">Failed</span>;
  }
  return <span className="badge badge-neutral badge-sm">Not taken</span>;
};

export const QuizzesTemplate: FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);

  const startQuiz = (id: string) => {
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === id ? { ...quiz, score: 100, status: 'Passed' } : quiz
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Test your knowledge.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiFileText />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Assessments</p>
              <p className="text-2xl font-bold tracking-tight">
                {quizzes.length} quizzes
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{quiz.title}</h3>
                    <p className="text-base-content/50 mt-1 text-xs">
                      {quiz.module}
                    </p>
                  </div>
                  {getStatusBadge(quiz.status)}
                </div>
                <div className="mb-3 flex items-center gap-4 text-xs">
                  <span className="text-base-content/50">
                    {quiz.questions} questions
                  </span>
                  <span className="text-base-content/50 flex items-center gap-1">
                    <FiAward className="h-3 w-3" />
                    Best score: {quiz.score > 0 ? `${quiz.score}%` : '--'}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => startQuiz(quiz.id)}
                    className="btn btn-primary btn-sm gap-1">
                    <FiZap />
                    Start quiz
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

QuizzesTemplate.displayName = 'QuizzesTemplate';
