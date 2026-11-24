import type { FC } from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  disabled?: boolean;
}

export const Slider: FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  disabled = false,
}) => (
  <div className="flex w-full flex-col gap-1">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">{label}</label>
      {showValue && (
        <span className="text-base-content/50 text-sm">{value}</span>
      )}
    </div>
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="range range-primary"
    />
  </div>
);
