'use client';

import { FC, useState } from 'react';
import { useData } from '@/exhibit/providers/wallet/DataProvider';
import { useToast } from '@/exhibit/providers/wallet/ToastProvider';

interface AddBillModalProps {
  open: boolean;
  onClose: () => void;
}

const AddBillModal: FC<AddBillModalProps> = ({ open, onClose }) => {
  const { addRecurringBill } = useData();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  );
  const [nextDue, setNextDue] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || !nextDue) return;

    await addRecurringBill({
      id: `bill-${Date.now()}`,
      name: name.trim(),
      amount: parseFloat(amount),
      currency,
      frequency,
      nextDue,
      paid: false,
    });

    showToast('Bill added successfully', 'success');
    setName('');
    setAmount('');
    setCurrency('USD');
    setFrequency('monthly');
    setNextDue('');
    onClose();
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">Add Bill</h3>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="floating-label">
            <span>Bill Name</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="floating-label">
            <span>Amount</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input input-bordered w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
            <span>Frequency</span>
            <select
              className="select select-bordered w-full"
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as 'weekly' | 'monthly' | 'yearly')
              }>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <label className="floating-label">
            <span>Next Due Date</span>
            <input
              type="date"
              className="input input-bordered w-full"
              value={nextDue}
              onChange={(e) => setNextDue(e.target.value)}
              required
            />
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-neutral" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Bill
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
};

export default AddBillModal;
