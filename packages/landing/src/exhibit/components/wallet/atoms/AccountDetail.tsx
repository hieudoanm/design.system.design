import { FC } from 'react';
import type { Account } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';
import { FiMoreVertical } from 'react-icons/fi';

interface AccountDetailProps {
  account: Account;
}

const AccountDetail: FC<AccountDetailProps> = ({ account }) => {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-60">{account.type}</p>
            <h3 className="text-lg font-semibold">{account.name}</h3>
            <p className="text-xs opacity-50">{account.accountNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {formatCurrency(account.balance, account.currency)}
            </p>
            <p className="text-xs opacity-50">{account.currency}</p>
          </div>
        </div>

        <div className="divider my-2" />

        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm flex-1">Send</button>
          <button className="btn btn-neutral btn-sm flex-1">Receive</button>
          <button
            className="btn btn-neutral btn-sm btn-circle"
            aria-label="More options">
            <FiMoreVertical />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
