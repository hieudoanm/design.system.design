import type { FC } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface DataVizProps {
  data: DataPoint[];
  title?: string;
  unit?: string;
}

export const DataViz: FC<DataVizProps> = ({
  data,
  title = 'Data Snapshot',
  unit = '',
}) => {
  const max = Math.max(...data.map((point) => point.value), 0);

  return (
    <section data-testid="data-viz" className="flex w-full flex-col gap-4">
      <h2>{title}</h2>
      <div className="flex w-full items-end justify-between gap-2">
        {data.map((point, index) => {
          const height = max > 0 ? Math.round((point.value / max) * 100) : 0;
          return (
            <div
              key={index}
              className="flex h-48 flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div
                  data-testid={`bar-${index}`}
                  style={{ height: `${height}%` }}
                  className="from-primary to-secondary w-full rounded-t-lg bg-gradient-to-b"
                />
              </div>
              <span className="text-sm">{point.label}</span>
              <span className="text-base-content/60 font-mono text-xs">
                {point.value}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
