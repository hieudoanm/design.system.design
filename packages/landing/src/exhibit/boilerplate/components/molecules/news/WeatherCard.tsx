import type { FC } from 'react';

interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
  unit?: 'C' | 'F';
  high?: number;
  low?: number;
  humidity?: number;
}

export const WeatherCard: FC<WeatherCardProps> = ({
  city,
  temperature,
  condition,
  unit = 'C',
  high,
  low,
  humidity,
}) => (
  <div
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="weather-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="card-title text-base">{city}</h3>
        <span className="text-5xl font-extralight">
          {temperature}°{unit}
        </span>
      </div>
      <p className="text-base-content/70 text-sm">{condition}</p>
      {(high !== undefined || low !== undefined || humidity !== undefined) && (
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {high !== undefined && (
            <div className="flex justify-between gap-4">
              <dt className="text-base-content/50">High</dt>
              <dd className="font-medium">
                {high}°{unit}
              </dd>
            </div>
          )}
          {low !== undefined && (
            <div className="flex justify-between gap-4">
              <dt className="text-base-content/50">Low</dt>
              <dd className="font-medium">
                {low}°{unit}
              </dd>
            </div>
          )}
          {humidity !== undefined && (
            <div className="flex justify-between gap-4">
              <dt className="text-base-content/50">Humidity</dt>
              <dd className="font-medium">{humidity}%</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  </div>
);
