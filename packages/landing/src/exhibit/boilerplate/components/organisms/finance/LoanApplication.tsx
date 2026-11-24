'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface LoanRequest {
  fullName: string;
  amount: number;
  termMonths: number;
  purpose: string;
}

interface LoanApplicationProps {
  onSubmit: (request: LoanRequest) => void;
  title?: string;
}

const inputClass = 'input input-bordered w-full';

export const LoanApplication: FC<LoanApplicationProps> = ({
  onSubmit,
  title = 'Loan application',
}) => {
  const [fullName, setFullName] = useState('');
  const [amount, setAmount] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = (): void => {
    if (fullName.trim() === '' || amount === '' || termMonths === '') {
      setError('Please fill in all required fields.');
      return;
    }
    setError(undefined);
    onSubmit({
      fullName: fullName.trim(),
      amount: Number(amount),
      termMonths: Number(termMonths),
      purpose,
    });
  };

  return (
    <form
      className="card bg-base-200 w-full"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}>
      <div className="card-body flex flex-col gap-3">
        <h3 className="card-title">{title}</h3>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Full name</span>
          </div>
          <input
            type="text"
            className={inputClass}
            placeholder="Jane Doe"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            data-testid="full-name"
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Amount</span>
          </div>
          <input
            type="number"
            className={inputClass}
            placeholder="10000"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            data-testid="amount"
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Term (months)</span>
          </div>
          <input
            type="number"
            className={inputClass}
            placeholder="24"
            value={termMonths}
            onChange={(event) => setTermMonths(event.target.value)}
            data-testid="term"
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Purpose</span>
          </div>
          <select
            className="select select-bordered w-full"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            data-testid="purpose">
            <option value="">Select a purpose</option>
            <option value="home">Home</option>
            <option value="car">Car</option>
            <option value="education">Education</option>
            <option value="business">Business</option>
          </select>
        </label>
        {error && (
          <span className="text-error text-sm" data-testid="error">
            {error}
          </span>
        )}
        <button type="submit" className="btn btn-primary w-full">
          Submit application
        </button>
      </div>
    </form>
  );
};
