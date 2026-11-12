import { FC } from 'react';
import type { BudgetCategory } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';
import { getBudgetIcon } from '@/exhibit/lib/wallet/iconMap';

interface BudgetCategoryCardProps {
  category: BudgetCategory;
}

const BudgetCategoryCard: FC<BudgetCategoryCardProps> = ({ category }) => {
  const percentage = Math.round((category.spent / category.limit) * 100);
  const isOver = category.spent > category.limit;
  const Icon = getBudgetIcon(category.name);

  return (
    <div
      className="card bg-base-200 shadow-md"
      data-testid={`budget-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="text-primary text-2xl" />
            <span className="font-medium">{category.name}</span>
          </div>
          {isOver && (
            <span className="badge badge-error badge-sm">Over budget</span>
          )}
        </div>

        <div className="flex items-end justify-between text-sm">
          <span className={isOver ? 'text-error' : ''}>
            {formatCurrency(category.spent)}
          </span>
          <span className="opacity-60">/ {formatCurrency(category.limit)}</span>
        </div>

        <progress
          className={`progress ${isOver ? 'progress-error' : 'progress-primary'} w-full`}
          value={category.spent}
          max={category.limit}
        />

        <p className="text-base-content/60 text-right text-xs">{percentage}%</p>
      </div>
    </div>
  );
};

export default BudgetCategoryCard;
