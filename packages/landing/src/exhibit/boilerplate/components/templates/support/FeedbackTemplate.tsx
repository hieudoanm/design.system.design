'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const RATINGS = [1, 2, 3, 4, 5];

export const FeedbackTemplate: FC = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (selectedRating === null) {
      setError(true);
      setSubmitted(false);
      return;
    }
    setError(false);
    setSubmitted(true);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-base-content/50 mt-1 text-sm">Tell us how we did.</p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {`Rating ${selectedRating ?? '—'}/5`}
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body flex flex-col gap-3 p-5">
            <div className="flex flex-wrap gap-2">
              {RATINGS.map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    setSelectedRating(rating);
                    setError(false);
                  }}
                  className={`btn btn-sm gap-1 ${
                    selectedRating === rating ? 'btn-primary' : 'btn-ghost'
                  }`}>
                  <FiStar />
                  Rate {rating}
                </button>
              ))}
            </div>
            <textarea
              aria-label="Feedback comment"
              placeholder="Tell us more..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="textarea textarea-bordered textarea-sm w-full"
            />
            <div className="flex items-center justify-between gap-4">
              <div>
                {error && (
                  <p role="alert" className="text-error text-sm">
                    Select a rating first
                  </p>
                )}
                {submitted && !error && (
                  <p className="text-success text-sm">
                    Thanks for your feedback
                  </p>
                )}
              </div>
              <button onClick={submit} className="btn btn-primary btn-sm">
                Submit
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

FeedbackTemplate.displayName = 'FeedbackTemplate';
