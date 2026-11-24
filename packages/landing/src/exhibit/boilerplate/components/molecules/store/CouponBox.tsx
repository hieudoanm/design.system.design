'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface CouponBoxProps {
  onApply: (code: string) => void;
  placeholder?: string;
}

export const CouponBox: FC<CouponBoxProps> = ({
  onApply,
  placeholder = 'Enter coupon code',
}) => {
  const [draft, setDraft] = useState('');
  const [applied, setApplied] = useState<string | null>(null);

  const apply = () => {
    const code = draft.trim();
    if (!code) return;
    setApplied(code);
    setDraft('');
    onApply(code);
  };

  return (
    <div className="flex w-full flex-col gap-2" data-testid="coupon-box">
      <div className="join w-full">
        <input
          className="input input-bordered join-item w-full"
          placeholder={placeholder}
          aria-label="Coupon code"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary join-item"
          onClick={apply}>
          Apply
        </button>
      </div>
      {applied && (
        <span
          className="badge badge-success self-start"
          data-testid="coupon-applied">
          {applied} applied
        </span>
      )}
    </div>
  );
};
