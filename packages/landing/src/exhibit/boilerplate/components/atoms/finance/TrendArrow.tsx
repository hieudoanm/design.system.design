import type { FC } from 'react';

interface TrendArrowProps {
  direction: 'up' | 'down' | 'flat';
  value?: number;
  className?: string;
}

const arrowGlyph: Record<TrendArrowProps['direction'], string> = {
  up: '▲',
  down: '▼',
  flat: '—',
};

const colorClass: Record<TrendArrowProps['direction'], string> = {
  up: 'text-success',
  down: 'text-error',
  flat: 'text-base-content/60',
};

export const TrendArrow: FC<TrendArrowProps> = ({
  direction,
  value,
  className = '',
}) => (
  <span
    data-testid="trend-arrow"
    aria-label={direction}
    className={`inline-flex items-center gap-1 ${colorClass[direction]} ${className}`}>
    <span>{arrowGlyph[direction]}</span>
    {value !== undefined ? (
      <span className="font-medium">{value.toFixed(1)}%</span>
    ) : null}
  </span>
);
