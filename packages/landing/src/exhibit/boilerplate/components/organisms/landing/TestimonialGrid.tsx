import type { FC } from 'react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

interface TestimonialGridProps {
  testimonials: Testimonial[];
  title?: string;
  columns?: 1 | 2 | 3;
  className?: string;
}

const columnsClass: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

export const TestimonialGrid: FC<TestimonialGridProps> = ({
  testimonials,
  title,
  columns = 3,
  className = '',
}) => (
  <section className={`flex w-full flex-col gap-4 ${className}`}>
    {title && <h2 className="text-xl font-semibold">{title}</h2>}
    <div className={`grid grid-cols-1 ${columnsClass[columns]} gap-4`}>
      {testimonials.map((testimonial) => (
        <figure
          key={testimonial.id}
          className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-2 p-4">
            <blockquote className="text-base-content/80 text-sm leading-relaxed">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-1 flex flex-col gap-0.5">
              <span className="text-sm font-medium">{testimonial.author}</span>
              {testimonial.role && (
                <span className="text-base-content/50 text-xs">
                  {testimonial.role}
                </span>
              )}
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  </section>
);

TestimonialGrid.displayName = 'TestimonialGrid';
