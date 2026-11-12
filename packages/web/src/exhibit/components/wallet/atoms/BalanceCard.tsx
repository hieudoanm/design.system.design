import { FC } from 'react';
import { FiDollarSign } from 'react-icons/fi';
import { formatCurrency } from '@/exhibit/lib/wallet/format';

interface BalanceCardProps {
  amount: number;
  currency?: string;
}

const BalanceCard: FC<BalanceCardProps> = ({ amount, currency = 'USD' }) => {
  return (
    <div className="card bg-primary text-primary-content shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <FiDollarSign className="text-lg" />
          <p className="text-sm opacity-80">Total Balance</p>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(amount, currency)}</p>
      </div>
    </div>
  );
};

export default BalanceCard;
