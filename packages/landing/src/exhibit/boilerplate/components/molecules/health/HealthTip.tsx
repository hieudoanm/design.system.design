import type { FC } from 'react';

interface HealthTipProps {
  tip: string;
  category?: string;
  source?: string;
}

export const HealthTip: FC<HealthTipProps> = ({ tip, category, source }) => (
  <div className="alert alert-info shadow" data-testid="health-tip">
    <span className="text-xl">💡</span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold">
        {category ? `${category}: ` : ''}
        {tip}
      </p>
      {source && <p className="text-base-content/60 text-xs">{source}</p>}
    </div>
  </div>
);
