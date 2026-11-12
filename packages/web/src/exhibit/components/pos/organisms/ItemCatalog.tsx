import { type FC } from 'react';
import { Money } from '@/exhibit/components/pos/atoms';
import type { Item } from '@/exhibit/types/pos';

interface ItemCatalogProps {
  items: Item[];
  onAdd: (item: Item) => void;
}

export const ItemCatalog: FC<ItemCatalogProps> = ({ items, onAdd }) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-sm font-bold">Items</h2>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onAdd(item)}
          className="border-base-300 bg-base-200 hover:bg-base-300 flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors">
          <span className="text-base-content text-sm font-bold">
            {item.name}
          </span>
          <span className="text-base-content/50 text-xs">{item.category}</span>
          <Money
            amount={item.price}
            className="text-primary text-sm font-bold"
          />
        </button>
      ))}
    </div>
  </div>
);
