import type { FC } from 'react';

interface WordCountProps {
  text?: string;
  count?: number;
  label?: string;
}

const wordsOf = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const WordCount: FC<WordCountProps> = ({ text, count, label = '' }) => {
  const total = count ?? (text ? wordsOf(text) : 0);
  const unit = total === 1 ? 'word' : 'words';
  return (
    <span data-testid="word-count" className="text-base-content/60 text-sm">
      {label && <span className="mr-1">{label}: </span>}
      {total} {unit}
    </span>
  );
};
