import { FC } from 'react';
import type { RecurringBill } from '@/exhibit/types/wallet';
import { formatCurrency, formatDate } from '@/exhibit/lib/wallet/format';
import { FiCheck } from 'react-icons/fi';
import { getBillIcon } from '@/exhibit/lib/wallet/iconMap';

interface BillItemProps {
  bill: RecurringBill;
  onPay?: (id: string) => void;
}

const BillItem: FC<BillItemProps> = ({ bill, onPay }) => {
  const Icon = getBillIcon(bill.name);

  return (
    <div
      className={`bg-base-200 flex items-center justify-between rounded-xl p-4 ${
        bill.paid ? 'opacity-60' : ''
      }`}>
      <div className="flex items-center gap-3">
        <Icon className="text-primary text-3xl" />
        <div>
          <p className="font-medium">{bill.name}</p>
          <p className="text-base-content/60 text-xs">
            Due {formatDate(bill.nextDue)} ·{' '}
            {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className="font-semibold">{formatCurrency(bill.amount)}</p>
        {bill.paid ? (
          <span className="badge badge-success badge-sm gap-1">
            <FiCheck /> Paid
          </span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onPay?.(bill.id)}>
            Pay
          </button>
        )}
      </div>
    </div>
  );
};

export default BillItem;
