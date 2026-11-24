import type { FC } from 'react';

interface SalesTrendProps {
  value: number;
  suffix?: string;
  label?: string;
}

interface Trend {
  arrow: string;
  sign: string;
  className: string;
}

const trendOf = (value: number): Trend => {
  if (value > 0) return { arrow: '▲', sign: '+', className: 'text-success' };
  if (value < 0) return { arrow: '▼', sign: '', className: 'text-error' };
  return { arrow: '—', sign: '', className: 'text-base-content/50' };
};

export const SalesTrend: FC<SalesTrendProps> = ({
  value,
  suffix = '%',
  label = '',
}) => {
  const trend = trendOf(value);
  return (
    <span
      data-testid="sales-trend"
      className={`badge badge-outline gap-1 ${trend.className}`}>
      {label && <span className="opacity-60">{label}</span>}
      <span>{trend.arrow}</span>
      {trend.sign}
      {value}
      {suffix}
    </span>
  );
};
