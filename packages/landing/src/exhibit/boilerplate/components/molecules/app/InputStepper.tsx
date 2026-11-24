'use client';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { FC } from 'react';

interface InputStepperProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export const InputStepper: FC<InputStepperProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const index = options.indexOf(value);
  const current = index === -1 ? 0 : index;

  const step = (delta: number): void => {
    const next = current + delta;
    if (next < 0 || next >= options.length) return;
    onChange(options[next]);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-base-content/50 text-xs">
          {current + 1} of {options.length}
        </span>
      </div>
      <div className="join w-full">
        <button
          type="button"
          aria-label={`Previous ${label}`}
          disabled={current <= 0}
          onClick={() => step(-1)}
          className="join-item btn btn-outline">
          <FiChevronLeft />
        </button>
        <div className="join-item bg-base-200 flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium">
          {options[current]}
        </div>
        <button
          type="button"
          aria-label={`Next ${label}`}
          disabled={current >= options.length - 1}
          onClick={() => step(1)}
          className="join-item btn btn-outline">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};
