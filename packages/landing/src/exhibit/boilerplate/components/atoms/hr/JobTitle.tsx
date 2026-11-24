import type { FC } from 'react';

interface JobTitleProps {
  title: string;
  className?: string;
}

export const JobTitle: FC<JobTitleProps> = ({ title, className = '' }) => (
  <span data-testid="job-title" className={`text-sm font-medium ${className}`}>
    {title}
  </span>
);
