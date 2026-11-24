import type { FC } from 'react';

interface Step {
  label: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  current: number;
}

export const Steps: FC<StepsProps> = ({ steps, current }) => (
  <ul className="steps w-full">
    {steps.map((step, index) => {
      const done = index < current;
      const active = index === current;
      return (
        <li
          key={step.label}
          data-content={done ? '✓' : index + 1}
          className={`step ${done ? 'step-primary' : ''} ${active ? 'step-primary' : ''}`}
          aria-current={active ? 'step' : undefined}>
          <div className="flex flex-col">
            <span>{step.label}</span>
            {step.description && (
              <span className="text-base-content/50 text-xs">
                {step.description}
              </span>
            )}
          </div>
        </li>
      );
    })}
  </ul>
);
