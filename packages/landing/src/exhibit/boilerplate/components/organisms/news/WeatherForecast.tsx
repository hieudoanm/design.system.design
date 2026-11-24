import type { FC } from 'react';

interface ForecastDay {
  day: string;
  condition: string;
  high: number;
  low: number;
  icon: string;
}

interface WeatherForecastProps {
  days: ForecastDay[];
  title?: string;
}

export const WeatherForecast: FC<WeatherForecastProps> = ({
  days,
  title = 'Weather Forecast',
}) => (
  <section
    data-testid="weather-forecast"
    className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {days.map((day, index) => (
        <article
          key={index}
          className="card bg-base-200 border-base-content/10 items-center rounded-xl border p-4 text-center">
          <h3 className="text-sm font-medium">{day.day}</h3>
          <span className="text-3xl" role="img" aria-label={day.condition}>
            {day.icon}
          </span>
          <p className="text-base-content/60 text-xs">{day.condition}</p>
          <p className="mt-1 font-mono text-sm">
            <span className="text-warning">{day.high}&deg;</span>
            <span className="text-base-content/40"> / </span>
            <span>{day.low}&deg;</span>
          </p>
        </article>
      ))}
    </div>
  </section>
);
