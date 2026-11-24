'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiChevronRight,
  FiShoppingCart,
  FiStar,
  FiThumbsUp,
} from 'react-icons/fi';

type ReviewFilter = 'all' | 'positive' | 'critical';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

const initialReviews: Review[] = [
  {
    id: '1',
    author: 'Minh Tran',
    rating: 5,
    text: 'Excellent quality, exceeded my expectations.',
    date: 'Jul 28, 2026',
    helpful: 12,
  },
  {
    id: '2',
    author: 'Alice Nguyen',
    rating: 4,
    text: 'Very good value for the price.',
    date: 'Jul 19, 2026',
    helpful: 8,
  },
  {
    id: '3',
    author: 'Chen Wei',
    rating: 5,
    text: 'Fast shipping and great build quality.',
    date: 'Jul 10, 2026',
    helpful: 5,
  },
  {
    id: '4',
    author: 'Dan Lee',
    rating: 3,
    text: 'Average product, nothing special.',
    date: 'Jul 05, 2026',
    helpful: 3,
  },
  {
    id: '5',
    author: 'Sara Kim',
    rating: 4,
    text: 'Solid purchase, would buy again.',
    date: 'Jun 22, 2026',
    helpful: 1,
  },
];

const filterLabels: Record<ReviewFilter, string> = {
  all: 'All',
  positive: 'Positive',
  critical: 'Critical',
};

const filterOptions: ReviewFilter[] = ['all', 'positive', 'critical'];

const averageRating = (
  initialReviews.reduce((sum, review) => sum + review.rating, 0) /
  initialReviews.length
).toFixed(1);

export const ReviewsTemplate: FC = () => {
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>(
    Object.fromEntries(
      initialReviews.map(
        (review) => [review.id, review.helpful] as [string, number]
      )
    )
  );

  const visible = initialReviews.filter((review) => {
    if (filter === 'all') return true;
    if (filter === 'positive') return review.rating >= 4;
    return review.rating < 4;
  });

  const markHelpful = (id: string) =>
    setHelpfulCounts((prev) => ({ ...prev, [id]: prev[id] + 1 }));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <Link href="/store/cart" className="btn btn-ghost btn-sm">
          <FiShoppingCart className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/store"
              className="text-base-content/50 hover:text-primary transition-colors">
              Store
            </Link>
            <FiChevronRight className="text-base-content/30 h-3 w-3" />
            <span>Reviews</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`btn btn-sm ${
                  filter === option ? 'btn-primary' : 'btn-ghost'
                }`}>
                {filterLabels[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2>Product reviews</h2>
          <p className="text-base-content/50 mt-1 text-sm">
            What customers say about this product.
          </p>
        </div>

        <div className="border-base-content/10 bg-base-200 mb-8 flex items-center gap-6 rounded-xl border p-6">
          <div className="text-primary text-4xl font-bold">
            {averageRating} / 5
          </div>
          <div>
            <p className="flex items-center gap-1 text-sm">
              <FiStar className="fill-warning text-warning h-4 w-4" />
              {averageRating} average rating
            </p>
            <p className="text-base-content/50 mt-1 text-xs">
              {initialReviews.length} reviews
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {visible.map((review) => (
            <div
              key={review.id}
              className="border-base-content/10 bg-base-200 rounded-xl border p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">{review.author}</p>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FiStar
                        key={i}
                        className={
                          i < review.rating
                            ? 'fill-warning text-warning h-3 w-3'
                            : 'text-base-content/20 h-3 w-3'
                        }
                      />
                    ))}
                  </span>
                </div>
                <span className="text-base-content/40 text-xs">
                  {review.date}
                </span>
              </div>
              <p className="text-base-content/70 mt-3 text-sm">{review.text}</p>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => markHelpful(review.id)}
                  className="btn btn-ghost btn-xs gap-1">
                  <FiThumbsUp className="h-3 w-3" />
                  Helpful ({helpfulCounts[review.id]})
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-primary text-lg font-bold tracking-tight">
            Boilerplate
          </p>
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate Store &middot; Built
            with care
          </p>
        </div>
      </footer>
    </div>
  );
};

ReviewsTemplate.displayName = 'ReviewsTemplate';
