import { type FC } from 'react';
import { EmptyState, Money } from '@/exhibit/components/pos/atoms';
import type { ItemSaleTotal } from '@/exhibit/lib/pos';

interface TopItemsListProps {
  items: ItemSaleTotal[];
  emptyMessage: string;
}

export const TopItemsList: FC<TopItemsListProps> = ({
  items,
  emptyMessage,
}) => {
  if (items.length === 0) return <EmptyState>{emptyMessage}</EmptyState>;

  return (
    <ul className="divide-base-300 divide-y">
      {items.map((item) => (
        <li key={item.id} className="flex justify-between py-2 text-sm">
          <span>
            {item.name} × {item.quantity}
          </span>
          <Money amount={item.total} className="font-bold" />
        </li>
      ))}
    </ul>
  );
};
