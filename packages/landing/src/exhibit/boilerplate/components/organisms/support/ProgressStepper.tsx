import { FiCheck } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface ProgressStepperProps {
  steps: string[];
  activeStep: number;
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

interface StepBadgeProps {
  index: number;
  completed: boolean;
  active: boolean;
}

const StepBadge: FC<StepBadgeProps> = ({ index, completed, active }) => (
  <span
    className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm ${
      completed
        ? 'bg-primary border-primary text-primary-content'
        : active
          ? 'border-primary text-primary'
          : 'border-base-content/20 text-base-content/50'
    }`}>
    {completed ? <FiCheck aria-hidden="true" /> : index + 1}
  </span>
);

interface StepLabelProps {
  label: string;
  active: boolean;
  children: ReactNode;
}

const StepRow: FC<StepLabelProps> = ({ label, active, children }) => (
  <span
    className="flex items-center gap-2"
    aria-current={active ? 'step' : undefined}>
    {children}
    <span className={active ? 'font-medium' : ''}>{label}</span>
  </span>
);

export const ProgressStepper: FC<ProgressStepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  orientation = 'horizontal',
  className = '',
}) => {
  const vertical = orientation === 'vertical';

  return (
    <ol
      className={`flex ${vertical ? 'flex-col gap-4' : 'flex-wrap items-center gap-2'} ${className}`}>
      {steps.map((label, index) => {
        const completed = index < activeStep;
        const active = index === activeStep;
        const clickable = onStepClick !== undefined && index <= activeStep;
        const content = (
          <StepRow label={label} active={active}>
            <StepBadge index={index} completed={completed} active={active} />
          </StepRow>
        );
        const connector = index < steps.length - 1 && (
          <span
            className={`bg-base-content/20 ${
              vertical ? 'ml-4 h-4 w-px self-stretch' : 'h-px w-8'
            }`}
            aria-hidden="true"
          />
        );
        return (
          <li key={label} className="flex items-center gap-2">
            {clickable ? (
              <button type="button" onClick={() => onStepClick?.(index)}>
                {content}
              </button>
            ) : (
              content
            )}
            {connector}
          </li>
        );
      })}
    </ol>
  );
};
