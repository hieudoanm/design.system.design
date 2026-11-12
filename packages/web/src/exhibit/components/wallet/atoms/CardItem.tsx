import { FC } from 'react';
import type { Card } from '@/exhibit/types/wallet';
import { maskCardNumber, formatCurrency } from '@/exhibit/lib/wallet/format';
import { FiCreditCard } from 'react-icons/fi';

const cardColorStyles: Record<string, string> = {
  primary: 'bg-primary text-primary-content',
  secondary: 'bg-secondary text-secondary-content',
  accent: 'bg-accent text-accent-content',
};

const typeLabels: Record<Card['type'], string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
};

interface CardItemProps {
  card: Card;
  selected: boolean;
  onSelect: (id: string) => void;
}

const CardItem: FC<CardItemProps> = ({ card, selected, onSelect }) => {
  const spent = card.spentThisMonth ?? 0;
  const limit = card.spendingLimit ?? 0;
  const currency = card.currency ?? 'USD';
  const pct = limit ? Math.round((spent / limit) * 100) : 0;

  return (
    <button
      className={`card min-w-[280px] shrink-0 shadow-md transition-all ${
        selected ? 'ring-primary ring-2' : 'opacity-60 hover:opacity-100'
      }`}
      onClick={() => onSelect(card.id)}>
      <div
        className={`card-body ${cardColorStyles[card.color] ?? 'bg-primary text-primary-content'}`}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{card.name}</p>
            <span className="badge badge-sm badge-neutral self-start">
              {typeLabels[card.type]}
            </span>
          </div>
          <FiCreditCard className="text-xl" />
        </div>
        <p className="text-lg tracking-wider">{maskCardNumber(card.number)}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-60">Expires</p>
            <p className="text-sm">{card.expiry}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60">Spent</p>
            <p className="text-sm">
              {formatCurrency(spent, currency)} /{' '}
              {formatCurrency(limit, currency)}
            </p>
          </div>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white/80 transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {card.frozen && (
          <span className="badge badge-sm badge-neutral absolute top-3 right-3">
            Frozen
          </span>
        )}
      </div>
    </button>
  );
};

export default CardItem;
