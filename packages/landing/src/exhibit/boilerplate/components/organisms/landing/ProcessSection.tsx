import type { FC } from 'react';

interface ProcessStep {
  id: string;
  title: string;
  description?: string;
}

interface ProcessSectionProps {
  steps: ProcessStep[];
  current?: string;
  title?: string;
  className?: string;
}

export const ProcessSection: FC<ProcessSectionProps> = ({
  steps,
  current,
  title,
  className = '',
}) => (
  <section className={`flex w-full flex-col gap-4 ${className}`}>
    {title && <h2 className="text-xl font-semibold">{title}</h2>}
    <ol className="steps steps-vertical lg:steps-horizontal w-full">
      {steps.map((step, index) => {
        const state =
          current === undefined
            ? 'default'
            : current === step.id
              ? 'current'
              : steps.findIndex((s) => s.id === current) > index
                ? 'done'
                : 'default';

        return (
          <li
            key={step.id}
            className={`step ${state === 'done' ? 'step-primary' : ''} ${
              state === 'current' ? 'step-primary' : ''
            }`}>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{step.title}</span>
              {step.description && (
                <span className="text-base-content/50 text-xs">
                  Step {index + 1} — {step.description}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);

ProcessSection.displayName = 'ProcessSection';
