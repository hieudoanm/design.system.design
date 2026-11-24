import type { FC } from 'react';

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: string;
}

interface DeployPipelineProps {
  steps: PipelineStep[];
  title?: string;
}

const statusClass: Record<string, string> = {
  pending: 'badge-neutral',
  running: 'badge-info',
  success: 'badge-success',
  failed: 'badge-error',
};

const statusDot: Record<string, string> = {
  pending: 'bg-base-content/20',
  running: 'bg-info',
  success: 'bg-success',
  failed: 'bg-error',
};

export const DeployPipeline: FC<DeployPipelineProps> = ({
  steps,
  title = 'Deploy pipeline',
}) => (
  <section className="py-4">
    <h2 className="mb-4 text-xl">{title}</h2>
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-center gap-3">
          <span
            className={`${statusDot[step.status] ?? 'bg-base-content/20'} size-3 shrink-0 rounded-full`}
          />
          <div className="bg-base-200 border-base-content/10 flex flex-1 items-center justify-between rounded-xl border p-3">
            <div>
              <h3 className="text-sm font-medium">
                <span className="font-mono text-xs">{index + 1}.</span>{' '}
                {step.name}
              </h3>
              {step.duration && (
                <p className="text-base-content/40 text-xs">{step.duration}</p>
              )}
            </div>
            <span
              className={`badge badge-sm ${
                statusClass[step.status] ?? 'badge-ghost'
              }`}>
              {step.status}
            </span>
          </div>
        </li>
      ))}
    </ol>
  </section>
);
