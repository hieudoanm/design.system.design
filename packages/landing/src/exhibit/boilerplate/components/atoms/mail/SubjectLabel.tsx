import type { FC } from 'react';

interface SubjectLabelProps {
  subject: string;
  unread?: boolean;
  className?: string;
}

export const SubjectLabel: FC<SubjectLabelProps> = ({
  subject,
  unread = false,
  className = '',
}) => (
  <span
    data-testid="subject-label"
    className={`truncate ${
      unread ? 'text-base-content font-semibold' : 'text-base-content/70'
    } ${className}`}>
    {subject}
  </span>
);
