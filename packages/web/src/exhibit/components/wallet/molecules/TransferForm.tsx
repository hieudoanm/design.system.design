import { FC } from 'react';
import type { Account } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';
import { FiSend } from 'react-icons/fi';

interface TransferFormProps {
  accounts: Account[];
  fromAccount: string;
  recipient: string;
  amount: string;
  note: string;
  onFromAccountChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const TransferForm: FC<TransferFormProps> = ({
  accounts,
  fromAccount,
  recipient,
  amount,
  note,
  onFromAccountChange,
  onRecipientChange,
  onAmountChange,
  onNoteChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="floating-label">
        <span>From Account</span>
        <select
          className="select select-bordered w-full"
          value={fromAccount}
          onChange={(e) => onFromAccountChange(e.target.value)}>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({formatCurrency(acc.balance)})
            </option>
          ))}
        </select>
      </label>

      <label className="floating-label">
        <span>Recipient</span>
        <input
          type="text"
          placeholder="Recipient name or account"
          className="input input-bordered w-full"
          value={recipient}
          onChange={(e) => onRecipientChange(e.target.value)}
          required
        />
      </label>

      <label className="floating-label">
        <span>Amount</span>
        <input
          type="number"
          placeholder="0.00"
          className="input input-bordered w-full"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
      </label>

      <label className="floating-label">
        <span>Note (optional)</span>
        <input
          type="text"
          placeholder="What's this for?"
          className="input input-bordered w-full"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </label>

      <button type="submit" className="btn btn-primary w-full gap-2">
        <FiSend /> Continue
      </button>
    </form>
  );
};

export default TransferForm;
