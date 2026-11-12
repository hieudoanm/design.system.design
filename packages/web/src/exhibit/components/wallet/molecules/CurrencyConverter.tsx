import { FC } from 'react';
import type { CurrencyRate } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';
import { FiRepeat } from 'react-icons/fi';

interface CurrencyConverterProps {
  amount: string;
  from: string;
  to: string;
  rates: CurrencyRate[];
  converted: number;
  rate: number;
  onAmountChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSwap: () => void;
  onConvert: () => void;
}

const CurrencyConverter: FC<CurrencyConverterProps> = ({
  amount,
  from,
  to,
  rates,
  converted,
  rate,
  onAmountChange,
  onFromChange,
  onToChange,
  onSwap,
  onConvert,
}) => {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        <label className="floating-label">
          <span>Amount</span>
          <input
            type="number"
            placeholder="0.00"
            className="input input-bordered w-full text-2xl"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            min="0"
            step="0.01"
          />
        </label>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <label className="floating-label">
            <span>From</span>
            <select
              className="select select-bordered w-full"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}>
              {rates.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} — {r.name}
                </option>
              ))}
            </select>
          </label>

          <button
            className="btn btn-neutral btn-circle"
            aria-label="Swap currencies"
            onClick={onSwap}>
            <FiRepeat />
          </button>

          <label className="floating-label">
            <span>To</span>
            <select
              className="select select-bordered w-full"
              value={to}
              onChange={(e) => onToChange(e.target.value)}>
              {rates.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} — {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="bg-base-300 rounded-lg p-4 text-center">
          <p className="text-base-content/60 text-sm">You get</p>
          <p className="text-primary text-3xl font-bold">
            {formatCurrency(converted, to)}
          </p>
          <p className="text-base-content/60 text-xs">
            1 {from} = {rate.toFixed(4)} {to}
          </p>
        </div>

        <button className="btn btn-primary w-full" onClick={onConvert}>
          Convert
        </button>
      </div>
    </div>
  );
};

export default CurrencyConverter;
