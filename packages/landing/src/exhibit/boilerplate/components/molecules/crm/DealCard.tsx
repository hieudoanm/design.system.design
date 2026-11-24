import type { FC } from 'react';

interface DealCardProps {
  name: string;
  company: string;
  amount: number;
  stage?: string;
  probability?: number;
  owner?: string;
  currency?: string;
}

const stageBadge: Record<string, string> = {
  Prospecting: 'badge-ghost',
  Qualified: 'badge-info',
  Proposal: 'badge-warning',
  Negotiation: 'badge-secondary',
  Won: 'badge-success',
  Lost: 'badge-error',
};

export const DealCard: FC<DealCardProps> = ({
  name,
  company,
  amount,
  stage = 'Prospecting',
  probability = 0,
  owner,
  currency = '$',
}) => (
  <article data-testid="deal-card" className="card bg-base-100 shadow-sm">
    <div className="card-body">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="card-title">{name}</h3>
          <p className="text-base-content/60 text-sm">{company}</p>
        </div>
        <div className={`badge ${stageBadge[stage] ?? 'badge-ghost'}`}>
          {stage}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold">
        {currency}
        {amount.toLocaleString()}
      </p>
      <progress
        className="progress progress-primary h-2 w-full"
        value={probability}
        max={100}
      />
      <div className="text-base-content/50 flex items-center justify-between text-xs">
        <span>{probability}% chance</span>
        {owner && <span>Owner: {owner}</span>}
      </div>
    </div>
  </article>
);

DealCard.displayName = 'DealCard';
