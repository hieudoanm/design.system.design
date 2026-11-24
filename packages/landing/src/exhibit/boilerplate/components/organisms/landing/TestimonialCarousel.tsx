'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { FC } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}

interface TestimonialCarouselProps {
  items: Testimonial[];
  className?: string;
}

export const TestimonialCarousel: FC<TestimonialCarouselProps> = ({
  items,
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const count = items.length;

  const goTo = (next: number): void =>
    setIndex(((next % count) + count) % count);

  if (count === 0) return null;

  const current = items[index];

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <blockquote className="card bg-base-200 border-base-content/10 border">
        <div className="card-body gap-4">
          <p className="text-lg leading-relaxed">“{current.quote}”</p>
          <footer className="flex items-center gap-3">
            {current.avatar ? (
              <img
                src={current.avatar}
                alt={current.author}
                className="size-10 rounded-full"
              />
            ) : (
              <span className="bg-primary text-primary-content flex size-10 items-center justify-center rounded-full font-semibold">
                {current.author.charAt(0)}
              </span>
            )}
            <div className="flex flex-col">
              <span className="font-medium">{current.author}</span>
              {current.role && (
                <span className="text-base-content/50 text-sm">
                  {current.role}
                </span>
              )}
            </div>
          </footer>
        </div>
      </blockquote>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => goTo(index - 1)}
          className="btn btn-circle btn-ghost btn-sm">
          <FiChevronLeft aria-hidden="true" />
        </button>
        <div className="flex items-center gap-1">
          {items.map((item, i) => (
            <button
              key={item.author}
              type="button"
              role="tab"
              aria-label={`Show testimonial ${i + 1}`}
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`size-2 rounded-full ${
                i === index ? 'bg-primary' : 'bg-base-content/20'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => goTo(index + 1)}
          className="btn btn-circle btn-ghost btn-sm">
          <FiChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
