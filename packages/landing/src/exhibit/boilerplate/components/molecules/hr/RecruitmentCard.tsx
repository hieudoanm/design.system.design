import type { FC } from 'react';

interface RecruitmentCardProps {
  title: string;
  applicants: number;
  hired: number;
  openRoles: number;
  department?: string;
  deadline?: string;
  className?: string;
}

export const RecruitmentCard: FC<RecruitmentCardProps> = ({
  title,
  applicants,
  hired,
  openRoles,
  department,
  deadline,
  className = '',
}) => {
  const pipeline = applicants + hired;
  const hireRate = pipeline === 0 ? 0 : Math.round((hired / pipeline) * 100);

  return (
    <article
      data-testid="recruitment-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        <span className="badge badge-primary badge-sm">{openRoles} open</span>
      </div>
      {department && (
        <p className="text-base-content/70 text-sm">{department}</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="bg-base-100 rounded-lg p-2">
          <div className="text-lg font-semibold">{applicants}</div>
          <div className="text-base-content/50 text-xs">Applicants</div>
        </div>
        <div className="bg-base-100 rounded-lg p-2">
          <div className="text-lg font-semibold">{hired}</div>
          <div className="text-base-content/50 text-xs">Hired</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <progress
          className="progress progress-primary flex-1"
          value={hireRate}
          max={100}
          aria-label="Hire rate"
        />
        <span className="text-base-content/50">{hireRate}% hire rate</span>
      </div>
      {deadline && (
        <p className="text-base-content/50 mt-2 text-xs">Closes {deadline}</p>
      )}
    </article>
  );
};
