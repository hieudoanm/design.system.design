import { type FC } from 'react';
import type { InventoryAdjustment, Item } from '@/exhibit/types/pos';

interface AdjustmentListProps {
  adjustments: InventoryAdjustment[];
  items: Item[];
  limit?: number;
}

export const AdjustmentList: FC<AdjustmentListProps> = ({
  adjustments,
  items,
  limit = 10,
}) => {
  if (adjustments.length === 0) return null;

  return (
    <div className="border-base-300 border-t p-4">
      <h2 className="mb-2 text-xs font-semibold">Recent Adjustments</h2>
      <ul className="max-h-40 overflow-y-auto text-xs">
        {adjustments.slice(0, limit).map((a) => (
          <li key={a.id} className="border-b py-1">
            <span className="font-mono">
              {items.find((i) => i.id === a.itemId)?.name ?? a.itemId}
            </span>{' '}
            {a.previousStock} → {a.newStock}
            <span className="text-base-content/50"> ({a.reason})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
