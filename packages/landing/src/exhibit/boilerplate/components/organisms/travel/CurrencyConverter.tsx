'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface CurrencyConverterProps {
  initialAmount?: number;
}

const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP'] as const;

type Currency = (typeof CURRENCIES)[number];

const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  JPY: 151.5,
  GBP: 0.78,
};

export const CurrencyConverter: FC<CurrencyConverterProps> = ({
  initialAmount = 100,
}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [from, setFrom] = useState<Currency>('USD');
  const [to, setTo] = useState<Currency>('EUR');

  const converted = (amount * RATES[to]) / RATES[from];

  return (
    <section
      data-testid="currency-converter"
      className="card bg-base-200 max-w-md">
      <div className="card-body gap-4">
        <h2 className="text-lg font-medium">Currency converter</h2>
        <div className="form-control w-full">
          <label className="label" htmlFor="currency-amount">
            Amount
          </label>
          <input
            id="currency-amount"
            type="number"
            className="input input-bordered"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-control w-full">
            <label className="label" htmlFor="currency-from">
              From
            </label>
            <select
              id="currency-from"
              className="select select-bordered"
              value={from}
              onChange={(event) => setFrom(event.target.value as Currency)}>
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control w-full">
            <label className="label" htmlFor="currency-to">
              To
            </label>
            <select
              id="currency-to"
              className="select select-bordered"
              value={to}
              onChange={(event) => setTo(event.target.value as Currency)}>
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="alert">
          <span>
            {amount.toFixed(2)} {from} ={' '}
            <strong data-testid="converted-amount">
              {converted.toFixed(2)}
            </strong>{' '}
            {to}
          </span>
        </div>
      </div>
    </section>
  );
};
