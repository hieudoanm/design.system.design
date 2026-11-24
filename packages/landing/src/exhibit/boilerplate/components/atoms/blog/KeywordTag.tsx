import type { FC } from 'react';

interface KeywordTagProps {
  label: string;
  href?: string;
}

export const KeywordTag: FC<KeywordTagProps> = ({ label, href }) => {
  const className = 'badge badge-ghost badge-sm';
  if (href) {
    return (
      <a href={href} data-testid="keyword-tag" className={className}>
        {label}
      </a>
    );
  }
  return (
    <span data-testid="keyword-tag" className={className}>
      {label}
    </span>
  );
};
