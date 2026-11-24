import type { FC } from 'react';

interface CustomerSegmentProps {
  name: string;
  count: number;
  description?: string;
  color?: string;
  avgOrderValue?: number;
  currency?: string;
}

const colorClass: Record<string, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export const CustomerSegment: FC<CustomerSegmentProps> = ({
  name,
  count,
  description,
  color = 'primary',
  avgOrderValue,
  currency = '$',
}) => (
  <article
    data-testid="customer-segment"
    className="card bg-base-100 shadow-sm">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`${colorClass[color] ?? 'bg-primary'} h-3 w-3 rounded-full`}
          />
          <h3 className="card-title text-base">{name}</h3>
        </div>
        <span className="badge badge-ghost badge-sm">{count} customers</span>
      </div>
      {description && (
        <p className="text-base-content/60 text-sm">{description}</p>
      )}
      {avgOrderValue !== undefined && (
        <p className="text-base-content/50 text-sm">
          Avg order: {currency}
          {avgOrderValue.toLocaleString()}
        </p>
      )}
    </div>
  </article>
);

CustomerSegment.displayName = 'CustomerSegment';
