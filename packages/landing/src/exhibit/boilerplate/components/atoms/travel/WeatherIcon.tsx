import type { FC } from 'react';

interface WeatherIconProps {
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'storm';
  temperature?: number;
}

const iconMap = {
  sunny: '☀️',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
  storm: '⛈️',
} as const;

export const WeatherIcon: FC<WeatherIconProps> = ({
  condition,
  temperature,
}) => (
  <span className="inline-flex items-center gap-1" data-testid="weather-icon">
    <span className="text-xl">{iconMap[condition]}</span>
    {temperature !== undefined && (
      <span className="text-sm font-medium">{temperature}°</span>
    )}
  </span>
);
