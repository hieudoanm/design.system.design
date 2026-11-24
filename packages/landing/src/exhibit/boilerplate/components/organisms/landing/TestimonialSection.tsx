import type { FC } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  initials?: string;
}

interface TestimonialSectionProps {
  items: Testimonial[];
  title?: string;
  columns?: 2 | 3;
}

export const TestimonialSection: FC<TestimonialSectionProps> = ({
  items,
  title = 'Testimonials',
  columns = 3,
}) => (
  <section className="py-10">
    {title && <h2 className="mb-6 text-center text-2xl">{title}</h2>}
    <div
      className={`grid gap-4 ${
        columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
      }`}>
      {items.map((item) => (
        <figure
          key={item.author}
          className="card bg-base-200 border-base-content/10 rounded-xl border p-6">
          <blockquote className="text-sm leading-relaxed">
            “{item.quote}”
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content w-8 rounded-full">
                <span className="text-xs">
                  {item.initials ?? item.author.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{item.author}</div>
              {item.role && (
                <div className="text-base-content/50 text-xs">{item.role}</div>
              )}
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
);
