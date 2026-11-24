'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface FollowUpTaskProps {
  id: string;
  title: string;
  dueDate: string;
  owner: string;
  completed?: boolean;
  onChange?: (id: string, completed: boolean) => void;
}

export const FollowUpTask: FC<FollowUpTaskProps> = ({
  id,
  title,
  dueDate,
  owner,
  completed = false,
  onChange,
}) => {
  const [isDone, setIsDone] = useState(completed);

  const toggle = () => {
    const next = !isDone;
    setIsDone(next);
    onChange?.(id, next);
  };

  return (
    <div data-testid="follow-up-task" className="card bg-base-100 shadow-sm">
      <div className="card-body flex-row items-center gap-3 p-4">
        <input
          type="checkbox"
          checked={isDone}
          onChange={toggle}
          aria-label={`Mark ${title} done`}
          className="checkbox checkbox-primary"
        />
        <div
          className={`flex-1 ${
            isDone ? 'text-base-content/40 line-through' : ''
          }`}>
          <p className="font-medium">{title}</p>
          <p className="text-base-content/50 text-sm">
            Due {dueDate} · {owner}
          </p>
        </div>
        <span
          className={`badge badge-sm ${
            isDone ? 'badge-success' : 'badge-warning'
          }`}>
          {isDone ? 'Done' : 'Pending'}
        </span>
      </div>
    </div>
  );
};

FollowUpTask.displayName = 'FollowUpTask';
