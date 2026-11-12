import { FC } from 'react';
import type { Account } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';

interface AccountCardProps {
  account: Account;
}

const AccountCard: FC<AccountCardProps> = ({ account }) => {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <p className="text-sm opacity-60">{account.name}</p>
        <p className="text-xl font-semibold">
          {formatCurrency(account.balance, account.currency)}
        </p>
        <p className="text-xs opacity-50">{account.accountNumber}</p>
      </div>
    </div>
  );
};

export default AccountCard;
