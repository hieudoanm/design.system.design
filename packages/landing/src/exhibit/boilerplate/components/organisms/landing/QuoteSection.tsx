import type { FC, ReactNode } from 'react';

interface QuoteSectionProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: ReactNode;
  className?: string;
}

export const QuoteSection: FC<QuoteSectionProps> = ({
  quote,
  author,
  role,
  avatar,
  className = '',
}) => (
  <section
    className={`bg-base-200 flex w-full flex-col items-center gap-4 rounded-2xl p-8 text-center ${className}`}>
    <span aria-hidden="true" className="text-primary text-6xl leading-none">
      “
    </span>
    <blockquote className="text-xl leading-relaxed font-light">
      {quote}
    </blockquote>
    <figcaption className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        {avatar}
        <span className="font-medium">{author}</span>
      </div>
      {role && <span className="text-base-content/50 text-sm">{role}</span>}
    </figcaption>
  </section>
);

QuoteSection.displayName = 'QuoteSection';
