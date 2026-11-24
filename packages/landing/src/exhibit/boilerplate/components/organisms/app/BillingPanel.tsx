'use client';

import type { FC } from 'react';

interface Usage {
  label: string;
  used: number;
  limit: number;
}

interface BillingPanelProps {
  plan: string;
  price: string;
  billingCycle?: string;
  nextPayment?: string;
  usage?: Usage[];
  onManageBilling?: () => void;
  onUpgrade?: () => void;
}

export const BillingPanel: FC<BillingPanelProps> = ({
  plan,
  price,
  billingCycle,
  nextPayment,
  usage = [],
  onManageBilling,
  onUpgrade,
}) => (
  <section className="card bg-base-100 border-base-200 border shadow-sm">
    <div className="card-body gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="card-title text-base">{plan} plan</h3>
          <p className="text-base-content/50 text-sm">
            {price}
            {billingCycle ? ` / ${billingCycle}` : ''}
            {nextPayment ? ` · next payment ${nextPayment}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {onManageBilling && (
            <button
              type="button"
              data-testid="manage-billing"
              className="btn btn-outline btn-sm"
              onClick={onManageBilling}>
              Manage billing
            </button>
          )}
          {onUpgrade && (
            <button
              type="button"
              data-testid="upgrade-plan"
              className="btn btn-primary btn-sm"
              onClick={onUpgrade}>
              Upgrade
            </button>
          )}
        </div>
      </div>
      {usage.length > 0 && (
        <div className="flex flex-col gap-3">
          {usage.map((item) => {
            const pct = Math.min(
              100,
              Math.round((item.used / item.limit) * 100)
            );
            return (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-base-content/50">
                    {item.used} / {item.limit}
                  </span>
                </div>
                <progress
                  className={`progress ${pct >= 90 ? 'progress-error' : 'progress-primary'}`}
                  value={pct}
                  max={100}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  </section>
);
