import type { FC } from 'react';

interface InterviewCardProps {
  candidate: string;
  role: string;
  interviewer?: string;
  date: string;
  time: string;
  type: 'onsite' | 'phone' | 'video' | 'technical';
  status: 'scheduled' | 'completed' | 'cancelled';
  className?: string;
}

const statusBadge: Record<InterviewCardProps['status'], string> = {
  scheduled: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
};

export const InterviewCard: FC<InterviewCardProps> = ({
  candidate,
  role,
  interviewer,
  date,
  time,
  type,
  status,
  className = '',
}) => {
  return (
    <article
      data-testid="interview-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium">{candidate}</h3>
        <span className={`badge ${statusBadge[status]} badge-sm`}>
          {status}
        </span>
      </div>
      <p className="text-base-content/70 text-sm">{role}</p>
      <dl className="mt-3 flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-base-content/50">When</dt>
          <dd>
            {date} · {time}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-base-content/50">Type</dt>
          <dd>{type}</dd>
        </div>
        {interviewer && (
          <div className="flex justify-between">
            <dt className="text-base-content/50">Interviewer</dt>
            <dd>{interviewer}</dd>
          </div>
        )}
      </dl>
    </article>
  );
};
