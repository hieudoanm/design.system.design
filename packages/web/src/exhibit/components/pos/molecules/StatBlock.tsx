import { type FC } from 'react';
import { Money } from '@/exhibit/components/pos/atoms/Money';

interface StatBlockProps {
  title: string;
  count: number;
  totalSales: number;
  totalTax: number;
}

export const StatBlock: FC<StatBlockProps> = ({
  title,
  count,
  totalSales,
  totalTax,
}) => (
  <div className="stats stats-vertical bg-base-200 mb-4 w-full shadow">
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-primary">{count}</div>
    </div>
    <div className="stat">
      <div className="stat-title">Total Sales</div>
      <div className="stat-value text-success">
        <Money amount={totalSales} />
      </div>
    </div>
    <div className="stat">
      <div className="stat-title">Total Tax</div>
      <div className="stat-value">
        <Money amount={totalTax} />
      </div>
    </div>
  </div>
);
