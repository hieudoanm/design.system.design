import type { FC } from 'react';

interface SleepNight {
  day: string;
  hours: number;
  quality: number;
}

interface SleepInsightsProps {
  nights: SleepNight[];
  title?: string;
}

const qualityLabel = (quality: number): string => {
  if (quality >= 4) return 'Excellent';
  if (quality >= 3) return 'Good';
  return 'Restless';
};

const qualityClass = (quality: number): string => {
  if (quality >= 4) return 'text-success';
  if (quality >= 3) return 'text-warning';
  return 'text-error';
};

export const SleepInsights: FC<SleepInsightsProps> = ({
  nights,
  title = 'Sleep insights',
}) => {
  const averageHours =
    nights.length > 0
      ? nights.reduce((sum, night) => sum + night.hours, 0) / nights.length
      : 0;

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="card-title">{title}</h3>
          <span className="badge badge-primary" data-testid="average">
            {averageHours.toFixed(1)} hrs avg
          </span>
        </div>
        <div className="flex h-32 items-end gap-3" data-testid="sleep-bars">
          {nights.map((night) => (
            <div
              key={night.day}
              className="flex flex-1 flex-col items-center gap-1">
              <span className="text-base-content/60 text-xs">
                {night.hours.toFixed(1)}h
              </span>
              <div
                className="bg-primary w-full rounded-t"
                style={{
                  height: `${Math.min((night.hours / 10) * 100, 100)}%`,
                }}
              />
              <span className="text-base-content/50 text-xs">{night.day}</span>
            </div>
          ))}
        </div>
        <ul className="flex flex-col gap-1">
          {nights.map((night) => (
            <li
              key={night.day}
              className="flex items-center justify-between text-sm">
              <span>{night.day}</span>
              <span className={`font-medium ${qualityClass(night.quality)}`}>
                {qualityLabel(night.quality)}
              </span>
            </li>
          ))}
        </ul>
        {nights.length === 0 && (
          <p className="text-base-content/40 text-sm" data-testid="empty">
            No sleep data yet.
          </p>
        )}
      </div>
    </section>
  );
};
