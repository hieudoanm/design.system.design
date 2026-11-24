'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface QuizSectionProps {
  questions: Question[];
  title?: string;
}

export const QuizSection: FC<QuizSectionProps> = ({
  questions,
  title = 'Quiz',
}) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return null;

  const question = questions[current];

  const choose = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  };

  if (finished) {
    return (
      <section className="card bg-base-200 border-base-content/10 rounded-xl border">
        <div className="card-body items-center text-center">
          <h2>{title} complete</h2>
          <p data-testid="quiz-score" className="text-lg">
            You scored {score} out of {questions.length}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card bg-base-200 border-base-content/10 rounded-xl border">
      <div className="card-body">
        <header className="flex items-center justify-between">
          <h2>{title}</h2>
          <span className="badge badge-ghost">
            {current + 1} / {questions.length}
          </span>
        </header>
        <p data-testid="quiz-question" className="text-lg">
          {question.question}
        </p>
        <div className="flex flex-col gap-2">
          {question.options.map((option, index) => {
            let className = 'btn btn-outline btn-sm';
            if (selected !== null) {
              if (index === question.answer) {
                className = 'btn btn-success btn-sm';
              } else if (index === selected) {
                className = 'btn btn-error btn-sm';
              }
            }
            return (
              <button
                key={option}
                data-testid="quiz-option"
                className={className}
                onClick={() => choose(index)}>
                {option}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <button
            data-testid="quiz-next"
            className="btn btn-primary btn-sm mt-2"
            onClick={next}>
            {current + 1 >= questions.length ? 'See results' : 'Next question'}
          </button>
        )}
      </div>
    </section>
  );
};
