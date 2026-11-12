import { FC } from 'react';
import { formatCurrency } from '@/exhibit/lib/wallet/format';
import { FiSend } from 'react-icons/fi';

interface TransferConfirmationProps {
  recipient: string;
  amount: string;
  note: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const TransferConfirmation: FC<TransferConfirmationProps> = ({
  recipient,
  amount,
  note,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body items-center gap-4 text-center">
        <FiSend className="text-5xl" />
        <h2 className="card-title">Confirm Transfer</h2>

        <div className="w-full space-y-2">
          <div className="bg-base-300 flex justify-between rounded-lg p-3">
            <span className="opacity-60">To</span>
            <span className="font-medium">{recipient}</span>
          </div>
          <div className="bg-base-300 flex justify-between rounded-lg p-3">
            <span className="opacity-60">Amount</span>
            <span className="text-primary text-xl font-bold">
              {formatCurrency(Number(amount) || 0)}
            </span>
          </div>
          {note && (
            <div className="bg-base-300 flex justify-between rounded-lg p-3">
              <span className="opacity-60">Note</span>
              <span>{note}</span>
            </div>
          )}
        </div>

        <div className="card-actions mt-4 w-full">
          <button className="btn btn-neutral flex-1" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary flex-1" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferConfirmation;
