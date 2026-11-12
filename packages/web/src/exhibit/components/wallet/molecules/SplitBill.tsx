import { FC, useState } from 'react';
import type { Contact } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';
import { FiUsers, FiDollarSign, FiCheckCircle } from 'react-icons/fi';

interface SplitBillProps {
  totalAmount: number;
  contacts: Contact[];
  onSplit: (splits: { contactId: string; amount: number }[]) => void;
}

const SplitBill: FC<SplitBillProps> = ({ totalAmount, contacts, onSplit }) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>(
    {}
  );

  console.log('[SplitBill] render', { totalAmount, contacts: contacts.length });

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const perPerson =
    selectedContacts.length > 0
      ? totalAmount / (selectedContacts.length + 1)
      : 0;

  const handleSplit = () => {
    if (splitType === 'equal') {
      const splits = selectedContacts.map((contactId) => ({
        contactId,
        amount: perPerson,
      }));
      onSplit(splits);
    } else {
      const splits = selectedContacts
        .filter((contactId) => (customAmounts[contactId] ?? 0) > 0)
        .map((contactId) => ({
          contactId,
          amount: customAmounts[contactId] ?? 0,
        }));
      onSplit(splits);
    }
  };

  const totalCustom = Object.values(customAmounts).reduce(
    (sum, amt) => sum + amt,
    0
  );
  const yourShare =
    splitType === 'equal' ? perPerson : totalAmount - totalCustom;
  const isValid =
    selectedContacts.length > 0 &&
    (splitType === 'equal' || totalCustom <= totalAmount);

  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-200 shadow-md">
        <div className="card-body gap-3">
          <div className="flex items-center justify-between">
            <span className="text-base-content/60 text-sm">Total Bill</span>
            <span className="text-xl font-bold">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="divider my-0" />

          <div className="flex gap-2">
            <button
              className={`btn btn-sm flex-1 ${splitType === 'equal' ? 'btn-primary' : 'btn'}`}
              onClick={() => setSplitType('equal')}>
              Equal Split
            </button>
            <button
              className={`btn btn-sm flex-1 ${splitType === 'custom' ? 'btn-primary' : 'btn'}`}
              onClick={() => setSplitType('custom')}>
              Custom Amounts
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-medium">Select Contacts</h3>
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => {
            const isSelected = selectedContacts.includes(contact.id);
            return (
              <div
                key={contact.id}
                className={`card cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary/10 ring-primary ring-2'
                    : 'bg-base-200'
                }`}
                onClick={() => toggleContact(contact.id)}>
                <div className="card-body flex-row items-center gap-3 p-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content w-8 rounded-full">
                      <span className="text-xs">
                        {contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                  </div>
                  <span className="flex-1 font-medium">{contact.name}</span>
                  {isSelected && splitType === 'equal' && (
                    <span className="text-primary text-sm font-medium">
                      {formatCurrency(perPerson)}
                    </span>
                  )}
                  {isSelected && splitType === 'custom' && (
                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}>
                      <FiDollarSign className="text-base-content/40 absolute top-1/2 left-2 -translate-y-1/2" />
                      <input
                        type="number"
                        className="input input-bordered input-sm w-24 pl-7"
                        value={customAmounts[contact.id] ?? ''}
                        onChange={(e) =>
                          setCustomAmounts((prev) => ({
                            ...prev,
                            [contact.id]: Number(e.target.value),
                          }))
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                  {isSelected && <FiCheckCircle className="text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedContacts.length > 0 && (
        <div className="card bg-base-200 shadow-md">
          <div className="card-body gap-2">
            <div className="flex items-center justify-between">
              <span className="text-base-content/60 text-sm">Your Share</span>
              <span
                className={`text-lg font-bold ${yourShare <= totalAmount ? 'text-primary' : 'text-error'}`}>
                {formatCurrency(yourShare)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/60">
                Split with {selectedContacts.length} people
              </span>
              {splitType === 'equal' && (
                <span>{formatCurrency(perPerson)} each</span>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary w-full gap-2"
        disabled={!isValid}
        onClick={handleSplit}>
        <FiUsers /> Split Bill
      </button>
    </div>
  );
};

export default SplitBill;
