import { FC } from 'react';

interface RateItemProps {
  symbol: string;
  code: string;
  name: string;
  rate: number;
}

const RateItem: FC<RateItemProps> = ({ symbol, code, name, rate }) => {
  return (
    <div className="bg-base-200 flex items-center justify-between rounded-xl p-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{symbol}</span>
        <span className="font-medium">{code}</span>
        <span className="text-base-content/60 text-sm">{name}</span>
      </div>
      <span className="font-mono text-sm">{rate.toFixed(4)}</span>
    </div>
  );
};

export default RateItem;
