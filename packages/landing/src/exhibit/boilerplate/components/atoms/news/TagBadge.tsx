import type { FC } from 'react';

interface TagBadgeProps {
  label: string;
  href?: string;
}

export const TagBadge: FC<TagBadgeProps> = ({ label, href }) => {
  const className = 'badge badge-outline badge-sm cursor-pointer';
  const content = <>{`#${label}`}</>;
  if (href) {
    return (
      <a href={href} className={className} data-testid="tag-badge">
        {content}
      </a>
    );
  }
  return (
    <span className={className} data-testid="tag-badge">
      {content}
    </span>
  );
};
