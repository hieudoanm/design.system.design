import type { FC } from 'react';

interface Account {
  name: string;
  type: string;
  number: string;
  balance: number;
}

interface AccountSummaryProps {
  accounts: Account[];
  currency?: string;
  showTotal?: boolean;
}

export const AccountSummary: FC<AccountSummaryProps> = ({
  accounts,
  currency = '$',
  showTotal = true,
}) => {
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="account-summary">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">Accounts</h3>
          {showTotal && (
            <span
              className="text-sm font-semibold"
              data-testid="accounts-total">
              {currency}
              {total.toLocaleString()}
            </span>
          )}
        </div>
        {accounts.length === 0 ? (
          <p className="text-base-content/50 text-sm">No accounts</p>
        ) : (
          <ul className="divide-base-content/10 flex flex-col divide-y">
            {accounts.map((account) => (
              <li
                key={account.number}
                className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{account.name}</p>
                  <p className="text-base-content/50 text-xs">
                    {account.type} · {account.number}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold">
                  {currency}
                  {account.balance.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
