import type { FC } from 'react';

interface TestimonialMarkProps {
  name: string;
  quote: string;
  company?: string;
}

export const TestimonialMark: FC<TestimonialMarkProps> = ({
  name,
  quote,
  company,
}) => (
  <figure data-testid="testimonial-mark" className="flex flex-col gap-2">
    <span className="text-primary text-4xl leading-none" aria-hidden="true">
      “
    </span>
    <blockquote className="text-base-content/80 border-0 p-0 italic">
      {quote}
    </blockquote>
    <figcaption className="text-base-content/50 text-sm">
      {name}
      {company && `, ${company}`}
    </figcaption>
  </figure>
);
