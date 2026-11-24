import type { FC } from 'react';

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  icon?: string;
  className?: string;
}

export const ProcessStep: FC<ProcessStepProps> = ({
  step,
  title,
  description,
  icon,
  className = '',
}) => {
  return (
    <div
      data-testid="process-step"
      className={`flex flex-col items-center gap-3 text-center ${className}`}>
      <div className="relative flex items-center justify-center">
        <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-xl">
          {icon ?? step}
        </span>
        <span className="bg-primary text-primary-content absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
          {step}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-base-content/70 max-w-xs text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
