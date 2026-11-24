import type { FC } from 'react';

interface JourneyStep {
  id: string;
  title: string;
  description?: string;
  status?: 'completed' | 'current' | 'upcoming';
}

interface CustomerJourneyProps {
  steps: JourneyStep[];
  title?: string;
}

const statusBadge: Record<string, string> = {
  completed: 'badge-success',
  current: 'badge-primary',
  upcoming: 'badge-ghost',
};

export const CustomerJourney: FC<CustomerJourneyProps> = ({
  steps,
  title = 'Customer journey',
}) => (
  <section className="py-4">
    <h2 className="mb-4 text-xl">{title}</h2>
    <ol className="flex flex-col gap-4">
      {steps.map((step) => (
        <li key={step.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={`mt-1 size-3 rounded-full ${
                step.status === 'completed'
                  ? 'bg-success'
                  : step.status === 'current'
                    ? 'bg-primary'
                    : 'bg-base-content/20'
              }`}
            />
            <span className="bg-base-content/10 w-px flex-1" />
          </div>
          <div className="bg-base-200 border-base-content/10 mb-1 flex-1 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base">{step.title}</h3>
              {step.status && (
                <span
                  className={`badge badge-sm ${
                    statusBadge[step.status] ?? 'badge-ghost'
                  }`}>
                  {step.status}
                </span>
              )}
            </div>
            {step.description && (
              <p className="text-base-content/50 mt-1 text-sm">
                {step.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  </section>
);
