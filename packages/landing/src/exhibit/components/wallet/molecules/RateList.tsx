import { FC } from 'react';
import type { CurrencyRate } from '@/exhibit/types/wallet';
import { RateItem } from '@/exhibit/components/wallet/atoms';

interface RateListProps {
  rates: CurrencyRate[];
}

const RateList: FC<RateListProps> = ({ rates }) => {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Exchange Rates</h2>
      <div className="flex flex-col gap-2">
        {rates.map((r) => (
          <RateItem
            key={r.code}
            symbol={r.symbol}
            code={r.code}
            name={r.name}
            rate={r.rate}
          />
        ))}
      </div>
    </div>
  );
};

export default RateList;
