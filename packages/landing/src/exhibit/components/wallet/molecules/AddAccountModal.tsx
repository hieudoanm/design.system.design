'use client';

import { FC, useState } from 'react';
import { useData } from '@/exhibit/providers/wallet/DataProvider';
import { useToast } from '@/exhibit/providers/wallet/ToastProvider';

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AddAccountModal: FC<AddAccountModalProps> = ({ open, onClose }) => {
  const { addAccount } = useData();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<'checking' | 'savings' | 'credit'>(
    'checking'
  );
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [accountNumber, setAccountNumber] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !balance || !accountNumber.trim()) return;

    await addAccount({
      id: `acc-${Date.now()}`,
      name: name.trim(),
      type,
      balance: parseFloat(balance),
      currency,
      accountNumber: accountNumber.trim(),
      color:
        type === 'checking'
          ? 'primary'
          : type === 'savings'
            ? 'secondary'
            : 'accent',
    });

    showToast('Account added successfully', 'success');
    setName('');
    setType('checking');
    setBalance('');
    setCurrency('USD');
    setAccountNumber('');
    onClose();
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">Add Account</h3>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="floating-label">
            <span>Account Name</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="floating-label">
            <span>Account Type</span>
            <select
              className="select select-bordered w-full"
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'checking' | 'savings' | 'credit')
              }>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit</option>
            </select>
          </label>
          <label className="floating-label">
            <span>Balance</span>
            <input
              type="number"
              step="0.01"
              className="input input-bordered w-full"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
          </label>
          <label className="floating-label">
            <span>Currency</span>
            <select
              className="select select-bordered w-full"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>VND</option>
            </select>
          </label>
          <label className="floating-label">
            <span>Account Number</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-neutral" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Account
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
};

export default AddAccountModal;
