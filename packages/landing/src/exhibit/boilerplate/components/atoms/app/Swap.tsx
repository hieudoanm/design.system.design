'use client';

import type { FC, ReactNode } from 'react';

interface SwapProps {
  first: ReactNode;
  second: ReactNode;
  on: boolean;
  onToggle: (next: boolean) => void;
  ariaLabel?: string;
}

export const Swap: FC<SwapProps> = ({
  first,
  second,
  on,
  onToggle,
  ariaLabel = 'Toggle',
}) => (
  <label className={`swap ${on ? 'swap-active' : ''}`} aria-label={ariaLabel}>
    <input
      type="checkbox"
      aria-label={ariaLabel}
      checked={on}
      onChange={(e) => onToggle(e.target.checked)}
    />
    <div className="swap-on">{first}</div>
    <div className="swap-off">{second}</div>
  </label>
);
