import type { FC } from 'react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  posted: string;
}

interface JobBoardProps {
  jobs: Job[];
  onApply?: (job: Job) => void;
}

const typeClass: Record<Job['type'], string> = {
  'full-time': 'badge-success',
  'part-time': 'badge-info',
  contract: 'badge-warning',
  internship: 'badge-secondary',
};

export const JobBoard: FC<JobBoardProps> = ({ jobs, onApply }) => (
  <div
    className="grid w-full grid-cols-1 gap-4 md:grid-cols-2"
    data-testid="job-board">
    {jobs.map((job) => (
      <article
        key={job.id}
        className="card bg-base-200 border-base-content/10 border">
        <div className="card-body">
          <div className="flex items-start justify-between gap-2">
            <h3 className="card-title text-base">{job.title}</h3>
            <span className={`badge badge-sm ${typeClass[job.type]}`}>
              {job.type}
            </span>
          </div>
          <div className="text-base-content/60 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span>{job.department}</span>
            <span>{job.location}</span>
            <span>Posted {job.posted}</span>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onApply?.(job)}
              className="btn btn-primary btn-sm">
              Apply
            </button>
          </div>
        </div>
      </article>
    ))}
    {jobs.length === 0 && (
      <div className="card bg-base-200 border-base-content/10 col-span-full border">
        <div className="card-body text-center">
          <p className="text-base-content/40 text-sm">No open positions</p>
        </div>
      </div>
    )}
  </div>
);

JobBoard.displayName = 'JobBoard';
