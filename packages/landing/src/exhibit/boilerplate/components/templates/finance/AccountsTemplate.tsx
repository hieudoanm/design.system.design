'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

type AccountType = 'Checking' | 'Savings' | 'Credit';

interface Account {
  id: string;
  name: string;
  number: number;
  balance: number;
  type: AccountType;
}

const ACCOUNTS: Account[] = [
  {
    id: 'a1',
    name: 'Business Checking',
    number: 4832,
    balance: 84250,
    type: 'Checking',
  },
  {
    id: 'a2',
    name: 'Business Savings',
    number: 1290,
    balance: 120000,
    type: 'Savings',
  },
  {
    id: 'a3',
    name: 'Corporate Credit',
    number: 7754,
    balance: 3500,
    type: 'Credit',
  },
  {
    id: 'a4',
    name: 'Operating Checking',
    number: 3301,
    balance: 15400,
    type: 'Checking',
  },
];

const getTypeBadge = (type: AccountType) => {
  switch (type) {
    case 'Savings':
      return <span className="badge badge-success badge-sm">Savings</span>;
    case 'Credit':
      return <span className="badge badge-warning badge-sm">Credit</span>;
    default:
      return <span className="badge badge-info badge-sm">Checking</span>;
  }
};

export const AccountsTemplate: FC = () => {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          View linked bank and credit accounts.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {ACCOUNTS.length} linked accounts
          </p>
          <button
            onClick={() => setHidden((prev) => !prev)}
            className="btn btn-ghost btn-sm gap-1">
            {hidden ? <FiEye /> : <FiEyeOff />}
            {hidden ? 'Show balances' : 'Hide balances'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ACCOUNTS.map((account) => (
            <div
              key={account.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  {getTypeBadge(account.type)}
                </div>
                <h3 className="text-sm font-semibold">{account.name}</h3>
                <p className="text-base-content/50 text-xs">
                  ****{account.number}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {hidden ? '••••' : `$${account.balance.toLocaleString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

AccountsTemplate.displayName = 'AccountsTemplate';
