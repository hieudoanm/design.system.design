'use client';

import type { FC } from 'react';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export const QuantityStepper: FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  label = 'Quantity',
}) => {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className="join" role="group" aria-label={label}>
      <button
        type="button"
        className="btn btn-ghost btn-sm join-item"
        aria-label="Decrease"
        onClick={() => onChange(clamp(value - step))}>
        -
      </button>
      <span
        className="btn btn-ghost btn-sm join-item no-animation"
        data-testid="quantity-value">
        {value}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm join-item"
        aria-label="Increase"
        onClick={() => onChange(clamp(value + step))}>
        +
      </button>
    </div>
  );
};
