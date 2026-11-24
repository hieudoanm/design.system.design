import type { FC } from 'react';

type TransportType = 'bus' | 'train' | 'taxi' | 'car' | 'bike';

interface TransportOptionProps {
  type: TransportType;
  provider: string;
  duration: string;
  price: number;
  departure?: string;
  currency?: string;
}

const iconMap: Record<TransportType, string> = {
  bus: '🚌',
  train: '🚆',
  taxi: '🚕',
  car: '🚗',
  bike: '🚲',
};

export const TransportOption: FC<TransportOptionProps> = ({
  type,
  provider,
  duration,
  price,
  departure,
  currency = '$',
}) => (
  <div
    className="border-base-300 flex items-center gap-4 rounded-xl border p-4"
    data-testid="transport-option">
    <span className="text-2xl">{iconMap[type]}</span>
    <div className="flex flex-col gap-0.5">
      <span className="font-medium capitalize">{type}</span>
      <span className="text-base-content/60 text-sm">
        {provider}
        {departure && ` · Departs ${departure}`}
      </span>
      <span className="text-base-content/50 text-xs">{duration}</span>
    </div>
    <span className="ml-auto font-semibold" data-testid="transport-price">
      {currency}
      {price.toFixed(2)}
    </span>
  </div>
);
