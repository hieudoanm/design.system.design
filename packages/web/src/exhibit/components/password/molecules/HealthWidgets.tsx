import { type FC } from 'react';
import { checkStrength } from '@/exhibit/data/password/models';
import type { VaultItem } from '@/exhibit/types/password';

export const severityBadge: Record<string, string> = {
  high: 'badge-error',
  medium: 'badge-warning',
  low: 'badge-ghost',
};

export const StatCard: FC<{
  label: string;
  value: number;
  className?: string;
}> = ({ label, value, className = 'bg-base-200' }) => (
  <div className={`card card-body text-center ${className}`}>
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-xs opacity-50">{label}</span>
  </div>
);

export const ItemRow: FC<{ item: VaultItem; label: string }> = ({
  item,
  label,
}) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span>{item.title}</span>
    <span className="badge badge-ghost badge-sm">{label}</span>
  </div>
);

export const StrengthItemRow: FC<{ item: VaultItem }> = ({ item }) => (
  <ItemRow item={item} label={checkStrength(item.password!).label} />
);

export const TrendChart: FC<{ scores: number[] }> = ({ scores }) => (
  <div className="flex h-24 items-end gap-1" data-testid="health-trend">
    {scores.length === 0 && (
      <p className="text-base-content/50 text-sm">
        Visit regularly to build a trend.
      </p>
    )}
    {scores.map((score, i) => (
      <div
        key={`${score}-${i}`}
        title={`${score}%`}
        className={`w-full rounded-t ${score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-error'}`}
        style={{ height: `${Math.max(score, 4)}%` }}
      />
    ))}
  </div>
);
