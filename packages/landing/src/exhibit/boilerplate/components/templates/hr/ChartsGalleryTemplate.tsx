'use client';

import type { FC } from 'react';
import { useState } from 'react';

const DATASETS = {
  Weekly: {
    label: 'Weekly',
    values: [30, 60, 45, 80, 55, 90, 70],
  },
  Monthly: {
    label: 'Monthly',
    values: [120, 200, 150, 280, 240, 320, 260, 180, 210],
  },
} as const;

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
];

type DatasetKey = keyof typeof DATASETS;

const buildPoints = (values: readonly number[]): string => {
  const max = Math.max(...values);
  const width = 300;
  const height = 120;
  return values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
};

const buildDonut = (values: readonly number[]): string => {
  const total = values.reduce((sum, value) => sum + value, 0);
  let acc = 0;
  return values
    .map((value, i) => {
      const share = (value / total) * 360;
      const segment = `${COLORS[i]} ${acc}deg ${acc + share}deg`;
      acc += share;
      return segment;
    })
    .join(', ');
};

export const ChartsGalleryTemplate: FC = () => {
  const [dataset, setDataset] = useState<DatasetKey>('Weekly');
  const data = DATASETS[dataset].values;
  const max = Math.max(...data);
  const points = buildPoints(data);
  const donut = buildDonut(data);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Charts
          </p>
          <h1>Charts gallery</h1>
          <p className="text-base-content/50 text-sm">
            Pure CSS and SVG charts, no chart library.
          </p>
        </div>

        <div className="join">
          {(Object.keys(DATASETS) as DatasetKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDataset(key)}
              className={`join-item btn ${dataset === key ? 'btn-primary' : ''}`}>
              {DATASETS[key].label}
            </button>
          ))}
        </div>

        <section className="border-base-content/10 bg-base-200 rounded-2xl border p-5">
          <h3>Bar chart</h3>
          <div className="flex h-40 items-end gap-2">
            {data.map((value, i) => (
              <div
                key={i}
                className="bg-primary flex-1 rounded-t"
                style={{ height: `${(value / max) * 100}%` }}
              />
            ))}
          </div>
        </section>

        <section className="border-base-content/10 bg-base-200 rounded-2xl border p-5">
          <h3>Line chart</h3>
          <svg
            viewBox="0 0 300 120"
            className="h-40 w-full"
            role="img"
            aria-label={`${DATASETS[dataset].label} line chart`}>
            <polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            {data.map((value, i) => {
              const x = (i / (data.length - 1)) * 300;
              const y = 120 - (value / max) * 120;
              return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
            })}
          </svg>
        </section>

        <section className="border-base-content/10 bg-base-200 rounded-2xl border p-5">
          <h3>Donut chart</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div
              className="relative h-40 w-40 rounded-full"
              style={{ background: `conic-gradient(${donut})` }}>
              <div className="bg-base-200 absolute inset-6 rounded-full" />
            </div>
            <ul className="flex flex-col gap-1">
              {data.map((value, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-base-content/10 bg-base-200 rounded-2xl border p-5">
          <h3>Progress bars</h3>
          <div className="flex flex-col gap-3">
            {data.map((value, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base-content/50 w-10 text-sm">
                  {value}
                </span>
                <div className="bg-base-content/10 h-3 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-success h-full rounded-full"
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-base-content/50 text-xs">
          Dataset: {DATASETS[dataset].label} — {data.length} values
        </p>
      </main>
    </div>
  );
};

ChartsGalleryTemplate.displayName = 'ChartsGalleryTemplate';
