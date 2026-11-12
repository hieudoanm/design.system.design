'use client';

import { type FC, useState } from 'react';
import { FiAlertTriangle, FiEdit } from 'react-icons/fi';
import {
  AdjustmentList,
  FilterTabs,
  PanelHeader,
} from '@/exhibit/components/pos/molecules';
import { filterLowStockItems, isLowStock } from '@/exhibit/lib/pos';
import type { InventoryAdjustment, Item } from '@/exhibit/types/pos';

type StockFilter = 'all' | 'low';

interface InventoryManagerProps {
  items: Item[];
  adjustments: InventoryAdjustment[];
  onUpdateStock: (itemId: string, newStock: number, reason: string) => void;
  onBack: () => void;
}

export const InventoryManager: FC<InventoryManagerProps> = ({
  items,
  adjustments,
  onUpdateStock,
  onBack,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [reason, setReason] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');

  const lowStockItems = filterLowStockItems(items);
  const displayed = filter === 'low' ? lowStockItems : items;

  const handleSave = (itemId: string) => {
    if (!reason.trim()) return;
    onUpdateStock(itemId, newStock, reason.trim());
    setEditingId(null);
    setReason('');
  };

  const tabs = [
    {
      key: 'all',
      label: `All (${items.length})`,
      activeClass: 'btn-primary',
    },
    {
      key: 'low',
      label: `Low Stock (${lowStockItems.length})`,
      activeClass: 'btn-warning',
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Inventory" onBack={onBack}>
        {lowStockItems.length > 0 && (
          <span className="badge badge-warning badge-sm gap-1">
            <FiAlertTriangle className="size-3" />
            {lowStockItems.length} low
          </span>
        )}
      </PanelHeader>

      <FilterTabs
        tabs={tabs}
        active={filter}
        onSelect={(key) => setFilter(key as StockFilter)}
      />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <table className="table-sm table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="text-right">Stock</th>
              <th className="text-right">Min</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((item) => (
              <StockRow
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                newStock={newStock}
                reason={reason}
                onStockChange={setNewStock}
                onReasonChange={setReason}
                onStartEditing={() => {
                  setEditingId(item.id);
                  setNewStock(item.stock);
                }}
                onCancel={() => setEditingId(null)}
                onSave={() => handleSave(item.id)}
              />
            ))}
          </tbody>
        </table>
      </main>

      <AdjustmentList adjustments={adjustments} items={items} />
    </div>
  );
};

interface StockRowProps {
  item: Item;
  isEditing: boolean;
  newStock: number;
  reason: string;
  onStockChange: (value: number) => void;
  onReasonChange: (value: string) => void;
  onStartEditing: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const StockRow: FC<StockRowProps> = ({
  item,
  isEditing,
  newStock,
  reason,
  onStockChange,
  onReasonChange,
  onStartEditing,
  onCancel,
  onSave,
}) => {
  const low = isLowStock(item);

  return (
    <tr className={low ? 'bg-warning/10' : ''}>
      <td>
        {item.name}
        <p className="text-base-content/50 text-xs">{item.category}</p>
      </td>
      <td className="text-right font-mono">
        {isEditing ? (
          <input
            type="number"
            aria-label={`New stock for ${item.name}`}
            className="input input-bordered input-xs w-20 text-right"
            value={newStock}
            onChange={(e) => onStockChange(Number(e.target.value))}
            min={0}
          />
        ) : (
          <span className={low ? 'text-warning' : ''}>{item.stock}</span>
        )}
      </td>
      <td className="text-base-content/50 text-right">
        {item.lowStockThreshold}
      </td>
      <td>
        {isEditing ? (
          <div className="flex gap-1">
            <input
              type="text"
              className="input input-bordered input-xs w-24"
              placeholder="Reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
            <button className="btn btn-success btn-xs" onClick={onSave}>
              Save
            </button>
            <button className="btn btn-ghost btn-xs" onClick={onCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            aria-label={`Edit ${item.name}`}
            className="btn btn-ghost btn-xs"
            onClick={onStartEditing}>
            <FiEdit className="size-3" />
          </button>
        )}
      </td>
    </tr>
  );
};
