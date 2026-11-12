'use client';

import { type FC } from 'react';
import { useState } from 'react';
import { EmptyState } from '@/exhibit/components/pos/atoms';
import { FormCard, PanelHeader } from '@/exhibit/components/pos/molecules';
import { formatMoney } from '@/exhibit/lib/pos';
import type { Shift } from '@/exhibit/types/pos';

interface ShiftManagerProps {
  shifts: Shift[];
  currentShift: Shift | null;
  onOpen: (openBalance: number) => void;
  onClose: (closeBalance: number) => void;
  onBack: () => void;
}

export const ShiftManager: FC<ShiftManagerProps> = ({
  shifts,
  currentShift,
  onOpen,
  onClose,
  onBack,
}) => {
  const [openBalance, setOpenBalance] = useState(0);
  const [closeBalance, setCloseBalance] = useState(0);

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Shifts" onBack={onBack} />

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        {currentShift ? (
          <FormCard title="Active Shift">
            <div className="text-sm">
              <p>
                Started: {new Date(currentShift.startedAt).toLocaleString()}
              </p>
              <p>Open Balance: {formatMoney(currentShift.openBalance)}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                className="input input-bordered input-sm flex-1"
                placeholder="Close balance"
                value={closeBalance || ''}
                onChange={(e) => setCloseBalance(Number(e.target.value))}
                min={0}
                step={0.01}
              />
              <button
                className="btn btn-error btn-sm"
                onClick={() => {
                  onClose(closeBalance);
                  setCloseBalance(0);
                }}>
                Close Shift
              </button>
            </div>
          </FormCard>
        ) : (
          <FormCard title="Open New Shift">
            <input
              type="number"
              className="input input-bordered input-sm"
              placeholder="Opening balance"
              value={openBalance || ''}
              onChange={(e) => setOpenBalance(Number(e.target.value))}
              min={0}
              step={0.01}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onOpen(openBalance);
                setOpenBalance(0);
              }}>
              Open Shift
            </button>
          </FormCard>
        )}

        <h2 className="mb-2 text-sm font-semibold">Shift History</h2>
        {shifts.length === 0 ? (
          <EmptyState>No shifts yet</EmptyState>
        ) : (
          <ul className="divide-base-300 divide-y">
            {shifts.map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">
                      {new Date(s.startedAt).toLocaleDateString()}
                    </p>
                    <p className="text-base-content/50 text-xs">
                      Open: {formatMoney(s.openBalance)}
                      {s.closeBalance != null &&
                        ` → Close: ${formatMoney(s.closeBalance)}`}
                    </p>
                  </div>
                  <span
                    className={`badge badge-xs ${
                      s.status === 'open' ? 'badge-success' : 'badge-ghost'
                    }`}>
                    {s.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
