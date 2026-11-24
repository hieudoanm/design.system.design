import type { FC } from 'react';

interface QuoteBlockProps {
  quote: string;
  author?: string;
  source?: string;
}

export const QuoteBlock: FC<QuoteBlockProps> = ({ quote, author, source }) => (
  <figure
    data-testid="quote-block"
    className="border-base-content/20 bg-base-200 flex flex-col gap-3 rounded-xl border-l-4 p-6">
    <blockquote className="text-lg italic">{quote}</blockquote>
    {(author || source) && (
      <figcaption className="text-base-content/60 text-sm">
        {author && <span>{author}</span>}
        {author && source && <span> — </span>}
        {source && <cite className="not-italic">{source}</cite>}
      </figcaption>
    )}
  </figure>
);

QuoteBlock.displayName = 'QuoteBlock';
