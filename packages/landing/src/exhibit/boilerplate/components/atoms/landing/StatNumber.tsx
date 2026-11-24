import type { FC } from 'react';

interface StatNumberProps {
  value: string | number;
  label: string;
}

export const StatNumber: FC<StatNumberProps> = ({ value, label }) => (
  <div data-testid="stat-number" className="flex flex-col">
    <span className="text-3xl font-bold">{value}</span>
    <span className="text-base-content/50 text-sm">{label}</span>
  </div>
);
