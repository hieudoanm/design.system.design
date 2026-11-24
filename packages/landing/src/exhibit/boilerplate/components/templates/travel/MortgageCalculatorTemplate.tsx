'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiHome,
  FiPercent,
} from 'react-icons/fi';

const MONTHLY_PAYMENT = '$3,212/mo';
const LOAN_AMOUNT = '$600,000';

const formatCurrency = (value: string) =>
  `$${parseInt(value, 10).toLocaleString('en-US')}`;

export const MortgageCalculatorTemplate: FC = () => {
  const [homePrice, setHomePrice] = useState('750000');
  const [downPayment, setDownPayment] = useState('150000');
  const [interestRate, setInterestRate] = useState('5.5');
  const [years, setYears] = useState('30');
  const [calculated, setCalculated] = useState(false);

  const calculate = () => {
    setCalculated(true);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          Mortgage Calculator
        </h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Estimate your monthly payment.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="form-control w-full">
                <span className="label-text mb-1 flex items-center gap-1 text-xs">
                  <FiHome className="h-3 w-3" />
                  Home price
                </span>
                <input
                  type="number"
                  value={homePrice}
                  onChange={(event) => setHomePrice(event.target.value)}
                  aria-label="Home price"
                  className="input input-bordered w-full"
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1 flex items-center gap-1 text-xs">
                  <FiDollarSign className="h-3 w-3" />
                  Down payment
                </span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(event) => setDownPayment(event.target.value)}
                  aria-label="Down payment"
                  className="input input-bordered w-full"
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1 flex items-center gap-1 text-xs">
                  <FiPercent className="h-3 w-3" />
                  Interest rate
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(event) => setInterestRate(event.target.value)}
                  aria-label="Interest rate"
                  className="input input-bordered w-full"
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1 flex items-center gap-1 text-xs">
                  <FiCalendar className="h-3 w-3" />
                  Loan term (years)
                </span>
                <input
                  type="number"
                  value={years}
                  onChange={(event) => setYears(event.target.value)}
                  aria-label="Loan term (years)"
                  className="input input-bordered w-full"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={calculate}
              className="btn btn-primary btn-sm w-fit gap-1">
              <FiCreditCard />
              Calculate
            </button>
          </div>
        </div>

        {calculated && (
          <div className="mt-6">
            <div className="stats stats-vertical sm:stats-horizontal mb-6 w-full">
              <div className="stat">
                <p className="stat-title">Monthly payment</p>
                <p className="stat-value text-2xl">{MONTHLY_PAYMENT}</p>
              </div>
              <div className="stat">
                <p className="stat-title">Loan amount</p>
                <p className="stat-value text-2xl">{LOAN_AMOUNT}</p>
              </div>
              <div className="stat">
                <p className="stat-title">Total payments</p>
                <p className="stat-value text-2xl">360</p>
              </div>
            </div>
            <div className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <h2 className="card-title text-base">Summary</h2>
                <table className="table-compact table">
                  <tbody>
                    <tr>
                      <td className="text-base-content/50">Home price</td>
                      <td className="text-right">
                        {formatCurrency(homePrice)}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-base-content/50">Down payment</td>
                      <td className="text-right">
                        {formatCurrency(downPayment)}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-base-content/50">Interest rate</td>
                      <td className="text-right">{interestRate}%</td>
                    </tr>
                    <tr>
                      <td className="text-base-content/50">Loan term</td>
                      <td className="text-right">{years} years</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-base-content/50 mt-3 text-xs">
                  360 payments over 30 years
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

MortgageCalculatorTemplate.displayName = 'MortgageCalculatorTemplate';
