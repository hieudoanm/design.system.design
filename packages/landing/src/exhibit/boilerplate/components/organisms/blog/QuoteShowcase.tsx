import type { FC } from 'react';

interface Quote {
  id: string;
  text: string;
  author?: string;
  role?: string;
}

interface QuoteShowcaseProps {
  quotes: Quote[];
  title?: string;
}

export const QuoteShowcase: FC<QuoteShowcaseProps> = ({
  quotes,
  title = 'What people say',
}) => (
  <section className="py-6">
    <h2 className="mb-4 text-xl">{title}</h2>
    <div className="grid gap-4 md:grid-cols-2">
      {quotes.map((quote) => (
        <figure
          key={quote.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <blockquote className="card-body">
            <span className="text-primary text-3xl" aria-hidden="true">
              “
            </span>
            <p className="text-base-content/80">{quote.text}</p>
            <figcaption className="text-base-content/50 mt-2 text-sm">
              {quote.author && (
                <span className="font-medium">{quote.author}</span>
              )}
              {quote.author && quote.role && <span> — {quote.role}</span>}
            </figcaption>
          </blockquote>
        </figure>
      ))}
    </div>
  </section>
);
