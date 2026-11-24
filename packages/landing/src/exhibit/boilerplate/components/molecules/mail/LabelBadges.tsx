import type { FC } from 'react';

interface LabelBadgesProps {
  labels: string[];
  emptyText?: string;
}

export const LabelBadges: FC<LabelBadgesProps> = ({
  labels,
  emptyText = 'No labels',
}) => (
  <div className="flex flex-wrap gap-1.5" data-testid="label-badges">
    {labels.length === 0 && (
      <span className="text-base-content/50 text-xs">{emptyText}</span>
    )}
    {labels.map((label) => (
      <span key={label} className="badge badge-outline badge-sm">
        {label}
      </span>
    ))}
  </div>
);

LabelBadges.displayName = 'LabelBadges';
