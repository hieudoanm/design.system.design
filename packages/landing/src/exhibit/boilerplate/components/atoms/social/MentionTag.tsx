import type { FC } from 'react';

interface MentionTagProps {
  name: string;
  href?: string;
}

export const MentionTag: FC<MentionTagProps> = ({ name, href }) => {
  const className = 'badge badge-neutral badge-sm gap-0.5 cursor-pointer';
  const content = (
    <>
      <span aria-hidden>@</span>
      {name}
    </>
  );
  if (href) {
    return (
      <a href={href} className={className} data-testid="mention-tag">
        {content}
      </a>
    );
  }
  return (
    <span className={className} data-testid="mention-tag">
      {content}
    </span>
  );
};
