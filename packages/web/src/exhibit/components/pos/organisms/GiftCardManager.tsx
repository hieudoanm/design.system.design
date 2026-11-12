'use client';

import { type FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { EmptyState } from '@/exhibit/components/pos/atoms';
import { FormCard, PanelHeader } from '@/exhibit/components/pos/molecules';
import type { GiftCard } from '@/exhibit/types/pos';

interface GiftCardManagerProps {
  giftCards: GiftCard[];
  onAdd: (gc: GiftCard) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}

export const GiftCardManager: FC<GiftCardManagerProps> = ({
  giftCards,
  onAdd,
  onRemove,
  onBack,
}) => {
  const [code, setCode] = useState('');
  const [balance, setBalance] = useState(0);

  const handleAdd = () => {
    if (!code.trim() || balance <= 0) return;
    onAdd({
      id: crypto.randomUUID(),
      code: code.trim().toUpperCase(),
      balance,
      initialBalance: balance,
      createdAt: new Date().toISOString(),
      active: true,
    });
    setCode('');
    setBalance(0);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Gift Cards" onBack={onBack} />

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <FormCard title="New Gift Card">
          <input
            type="text"
            className="input input-bordered input-sm"
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            type="number"
            className="input input-bordered input-sm"
            placeholder="Balance"
            value={balance || ''}
            onChange={(e) => setBalance(Number(e.target.value))}
            min={0}
            step={0.01}
          />
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            <FiPlus className="size-4" /> Create
          </button>
        </FormCard>

        <h2 className="mb-2 text-sm font-semibold">Active Gift Cards</h2>
        {giftCards.length === 0 ? (
          <EmptyState>No gift cards</EmptyState>
        ) : (
          <ul className="divide-base-300 divide-y">
            {giftCards.map((gc) => (
              <li
                key={gc.id}
                className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono text-sm font-bold">{gc.code}</p>
                  <p className="text-base-content/50 text-xs">
                    Balance: ${gc.balance.toFixed(2)} / $
                    {gc.initialBalance.toFixed(2)}
                  </p>
                </div>
                <button
                  aria-label={`Remove ${gc.code}`}
                  className="btn btn-ghost btn-xs"
                  onClick={() => onRemove(gc.id)}>
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
