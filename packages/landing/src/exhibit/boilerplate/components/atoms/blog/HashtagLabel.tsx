import type { FC } from 'react';

type HashtagSize = 'sm' | 'md';

interface HashtagLabelProps {
  label: string;
  href?: string;
  size?: HashtagSize;
}

const sizeClass: Record<HashtagSize, string> = {
  sm: 'badge-sm',
  md: 'badge-md',
};

export const HashtagLabel: FC<HashtagLabelProps> = ({
  label,
  href,
  size = 'md',
}) => {
  const className = `badge badge-outline gap-1 ${sizeClass[size]}`;
  const content = (
    <>
      <span className="font-semibold">#</span>
      {label}
    </>
  );
  if (href) {
    return (
      <a href={href} data-testid="hashtag-label" className={className}>
        {content}
      </a>
    );
  }
  return (
    <span data-testid="hashtag-label" className={className}>
      {content}
    </span>
  );
};
