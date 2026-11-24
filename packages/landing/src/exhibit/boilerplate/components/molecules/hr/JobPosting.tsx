import type { FC } from 'react';

interface JobPostingProps {
  title: string;
  department: string;
  location: string;
  type: string;
  salary?: string;
  postedAt?: string;
  deadline?: string;
  className?: string;
}

export const JobPosting: FC<JobPostingProps> = ({
  title,
  department,
  location,
  type,
  salary,
  postedAt,
  deadline,
  className = '',
}) => {
  return (
    <article
      data-testid="job-posting"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        <span className="badge badge-primary badge-sm">{type}</span>
      </div>
      <p className="text-base-content/70 mt-1 text-sm">{department}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="bg-base-100 badge">{location}</span>
        {salary && <span className="bg-base-100 badge">{salary}</span>}
        {postedAt && (
          <span className="bg-base-100 badge">Posted {postedAt}</span>
        )}
        {deadline && (
          <span className="bg-base-100 badge">Closes {deadline}</span>
        )}
      </div>
    </article>
  );
};
