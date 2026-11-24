import type { FC } from 'react';

interface OnboardingTaskProps {
  title: string;
  due: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
  category?: string;
  className?: string;
}

const statusBadge: Record<OnboardingTaskProps['status'], string> = {
  todo: 'badge-neutral',
  'in-progress': 'badge-warning',
  done: 'badge-success',
};

const statusIcon: Record<OnboardingTaskProps['status'], string> = {
  todo: '◯',
  'in-progress': '◐',
  done: '✔',
};

export const OnboardingTask: FC<OnboardingTaskProps> = ({
  title,
  due,
  status,
  assignee,
  category,
  className = '',
}) => {
  return (
    <div
      data-testid="onboarding-task"
      className={`bg-base-200 border-base-content/10 flex items-center gap-3 rounded-lg border p-4 ${className}`}>
      <span className="text-lg" aria-hidden="true">
        {statusIcon[status]}
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-base-content/50 text-xs">Due {due}</span>
      </div>
      {category && (
        <span className="bg-base-100 badge badge-sm hidden sm:inline-flex">
          {category}
        </span>
      )}
      <div className="flex flex-col items-end gap-1">
        <span className={`badge ${statusBadge[status]} badge-sm`}>
          {status}
        </span>
        {assignee && (
          <span className="text-base-content/50 text-xs">{assignee}</span>
        )}
      </div>
    </div>
  );
};
