import type { FC } from 'react';

interface ForecastDay {
  day: string;
  condition: string;
  high: number;
  low: number;
}

interface WeatherForecastProps {
  days: ForecastDay[];
}

export const WeatherForecast: FC<WeatherForecastProps> = ({ days }) => (
  <div
    className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    data-testid="weather-forecast">
    {days.map((forecast) => (
      <div
        key={forecast.day}
        className="border-base-300 flex flex-col items-center gap-1 rounded-xl border p-3">
        <span className="text-sm font-medium">{forecast.day}</span>
        <span className="text-2xl">⛅</span>
        <span className="text-sm">{forecast.condition}</span>
        <span
          className="text-base-content/60 text-xs"
          data-testid="weather-temp">
          {forecast.high}° / {forecast.low}°
        </span>
      </div>
    ))}
  </div>
);
