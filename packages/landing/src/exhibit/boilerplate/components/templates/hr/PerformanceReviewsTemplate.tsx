'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

type ReviewStatus = 'Pending' | 'Completed';
type ReviewFilter = 'All' | ReviewStatus;

interface PerformanceReview {
  id: string;
  employee: string;
  period: string;
  rating: number;
  status: ReviewStatus;
}

const REVIEWS: PerformanceReview[] = [
  {
    id: 'pr1',
    employee: 'Sofia Rossi',
    period: 'Q3 2026',
    rating: 4,
    status: 'Completed',
  },
  {
    id: 'pr2',
    employee: 'David Chen',
    period: 'Q3 2026',
    rating: 5,
    status: 'Completed',
  },
  {
    id: 'pr3',
    employee: 'Maya Singh',
    period: 'Q3 2026',
    rating: 0,
    status: 'Pending',
  },
  {
    id: 'pr4',
    employee: 'Tom Baker',
    period: 'Q3 2026',
    rating: 3,
    status: 'Completed',
  },
  {
    id: 'pr5',
    employee: 'Ana Garcia',
    period: 'Q3 2026',
    rating: 0,
    status: 'Pending',
  },
];

const FILTERS: ReviewFilter[] = ['All', 'Pending', 'Completed'];

const getStatusBadge = (status: ReviewStatus) => {
  if (status === 'Completed') {
    return <span className="badge badge-success badge-sm">Completed</span>;
  }
  return <span className="badge badge-warning badge-sm">Pending</span>;
};

export const PerformanceReviewsTemplate: FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>(REVIEWS);
  const [filter, setFilter] = useState<ReviewFilter>('All');

  const visible = reviews.filter(
    (review) => filter === 'All' || review.status === filter
  );

  const startReview = (id: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? { ...review, status: 'Completed', rating: 4 }
          : review
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          Performance Reviews
        </h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Review cycles and ratings.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiStar />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Reviews</p>
              <p className="text-2xl font-bold tracking-tight">
                {visible.length} reviews
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

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((review) => (
                    <tr
                      key={review.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {review.employee}
                      </td>
                      <td className="px-4 py-3 text-sm">{review.period}</td>
                      <td className="px-4 py-3 text-sm">{review.rating}/5</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-4 py-3">
                        {review.status === 'Pending' && (
                          <button
                            onClick={() => startReview(review.id)}
                            className="btn btn-primary btn-sm">
                            Start review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

PerformanceReviewsTemplate.displayName = 'PerformanceReviewsTemplate';
