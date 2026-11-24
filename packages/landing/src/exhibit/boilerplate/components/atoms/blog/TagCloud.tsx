import type { FC } from 'react';

interface TagCloudTag {
  label: string;
  weight: number;
}

interface TagCloudProps {
  tags: TagCloudTag[];
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export const TagCloud: FC<TagCloudProps> = ({
  tags,
  minSize = 12,
  maxSize = 28,
  className = '',
}) => {
  if (tags.length === 0) return null;

  const weights = tags.map((tag) => tag.weight);
  const low = Math.min(...weights);
  const high = Math.max(...weights);
  const span = high - low || 1;

  const fontSize = (weight: number): number =>
    minSize + ((weight - low) / span) * (maxSize - minSize);

  return (
    <div
      aria-label="Tag cloud"
      className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag.label}
          title={`${tag.weight} mentions`}
          className="text-base-content/70 hover:text-primary transition-colors"
          style={{ fontSize: fontSize(tag.weight) }}>
          {tag.label}
        </span>
      ))}
    </div>
  );
};
