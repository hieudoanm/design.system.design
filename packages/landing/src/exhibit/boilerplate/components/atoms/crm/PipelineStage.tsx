import type { FC } from 'react';

type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface PipelineStageProps {
  stage: string;
  index?: number;
  variant?: BadgeVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

export const PipelineStage: FC<PipelineStageProps> = ({
  stage,
  index,
  variant = 'neutral',
}) => (
  <span
    data-testid="pipeline-stage"
    className={`badge badge-outline gap-1 ${variantClass[variant]}`}>
    {index !== undefined && <span className="opacity-60">{index}</span>}
    {stage}
  </span>
);
