import type { FC } from 'react';

interface DateRangeProps {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  label?: string;
  min?: string;
  max?: string;
}

export const DateRange: FC<DateRangeProps> = ({
  start,
  end,
  onStartChange,
  onEndChange,
  label = 'Date range',
  min,
  max,
}) => (
  <div className="flex w-full flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="date-range-start"
          className="text-base-content/50 text-xs">
          From
        </label>
        <input
          id="date-range-start"
          type="date"
          aria-label={`${label} start`}
          className="input input-bordered input-sm w-full"
          value={start}
          min={min}
          max={end || max}
          onChange={(e) => onStartChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="date-range-end"
          className="text-base-content/50 text-xs">
          To
        </label>
        <input
          id="date-range-end"
          type="date"
          aria-label={`${label} end`}
          className="input input-bordered input-sm w-full"
          value={end}
          min={start || min}
          max={max}
          onChange={(e) => onEndChange(e.target.value)}
        />
      </div>
    </div>
  </div>
);
