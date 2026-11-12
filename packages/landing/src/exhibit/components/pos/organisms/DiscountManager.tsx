'use client';

import { type FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { EmptyState } from '@/exhibit/components/pos/atoms';
import { FormCard, PanelHeader } from '@/exhibit/components/pos/molecules';
import type { Discount } from '@/exhibit/types/pos';

interface DiscountManagerProps {
  discounts: Discount[];
  onAdd: (discount: Discount) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}

export const DiscountManager: FC<DiscountManagerProps> = ({
  discounts,
  onAdd,
  onRemove,
  onBack,
}) => {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(0);
  const [minPurchase, setMinPurchase] = useState(0);
  const [maxUses, setMaxUses] = useState(0);

  const handleAdd = () => {
    if (!code.trim() || value <= 0) return;
    onAdd({
      id: crypto.randomUUID(),
      code: code.trim().toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || undefined,
      maxUses: maxUses || undefined,
      usedCount: 0,
      active: true,
    });
    setCode('');
    setValue(0);
    setMinPurchase(0);
    setMaxUses(0);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Discounts" onBack={onBack} />

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <FormCard title="New Discount">
          <input
            type="text"
            className="input input-bordered input-sm"
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="select select-bordered select-sm"
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'percentage' | 'fixed')
              }>
              <option value="percentage">%</option>
              <option value="fixed">$</option>
            </select>
            <input
              type="number"
              className="input input-bordered input-sm flex-1"
              placeholder="Value"
              value={value || ''}
              onChange={(e) => setValue(Number(e.target.value))}
              min={0}
            />
          </div>
          <input
            type="number"
            className="input input-bordered input-sm"
            placeholder="Min purchase (optional)"
            value={minPurchase || ''}
            onChange={(e) => setMinPurchase(Number(e.target.value))}
            min={0}
          />
          <input
            type="number"
            className="input input-bordered input-sm"
            placeholder="Max uses (optional)"
            value={maxUses || ''}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            min={0}
          />
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            <FiPlus className="size-4" /> Add
          </button>
        </FormCard>

        <h2 className="mb-2 text-sm font-semibold">Active Discounts</h2>
        {discounts.length === 0 ? (
          <EmptyState>No discounts configured</EmptyState>
        ) : (
          <ul className="divide-base-300 divide-y">
            {discounts.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono text-sm font-bold">{d.code}</p>
                  <p className="text-base-content/50 text-xs">
                    {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}{' '}
                    off
                    {d.minPurchase && ` · min $${d.minPurchase}`}
                    {d.maxUses && ` · ${d.usedCount}/${d.maxUses} uses`}
                  </p>
                </div>
                <button
                  aria-label={`Remove ${d.code}`}
                  className="btn btn-ghost btn-xs"
                  onClick={() => onRemove(d.id)}>
                  <FiTrash2 className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
