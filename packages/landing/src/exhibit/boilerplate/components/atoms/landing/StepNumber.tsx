import type { FC } from 'react';

interface StepNumberProps {
  number: number;
  title: string;
  description?: string;
}

export const StepNumber: FC<StepNumberProps> = ({
  number,
  title,
  description,
}) => (
  <div data-testid="step-number" className="flex items-start gap-3">
    <span className="bg-primary text-primary-content flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
      {number}
    </span>
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{title}</span>
      {description && (
        <span className="text-base-content/60 text-sm">{description}</span>
      )}
    </div>
  </div>
);
