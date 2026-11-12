import { FC } from 'react';
import type { Card } from '@/exhibit/types/wallet';
import { maskCardNumber, formatCurrency } from '@/exhibit/lib/wallet/format';
import {
  FiCreditCard,
  FiLock,
  FiUnlock,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';
import CardSpending from './CardSpending';
import CardActions from './CardActions';

const typeLabels: Record<Card['type'], string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
};

interface CardDetailProps {
  card: Card;
  onToggleFreeze?: () => void;
}

const CardDetail: FC<CardDetailProps> = ({ card, onToggleFreeze }) => {
  const spent = card.spentThisMonth ?? 0;
  const limit = card.spendingLimit ?? 0;
  const currency = card.currency ?? 'USD';
  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-200 shadow-md">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h3 className="card-title">{card.name}</h3>
            <span className="badge badge-sm badge-neutral">
              {typeLabels[card.type]}
            </span>
          </div>

          <div className="text-base-content/60 flex items-center gap-2">
            <FiCreditCard />
            <p className="font-mono tracking-wider">
              {maskCardNumber(card.number)}
            </p>
          </div>

          <div className="divider my-0" />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FiUser className="text-base-content/40" />
              <div>
                <p className="text-base-content/60 text-xs">Cardholder</p>
                <p className="text-sm font-medium">
                  {card.cardholderName ?? 'Cardholder'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-base-content/40" />
              <div>
                <p className="text-base-content/60 text-xs">Expires</p>
                <p className="text-sm font-medium">{card.expiry}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {card.frozen ? (
              <FiLock className="text-warning" />
            ) : (
              <FiUnlock className="text-success" />
            )}
            <span
              className={`text-sm font-medium ${card.frozen ? 'text-warning' : 'text-success'}`}>
              {card.frozen ? 'Frozen — no transactions allowed' : 'Active'}
            </span>
          </div>

          <div className="bg-base-300 flex items-center justify-between rounded-lg p-3">
            <span className="text-base-content/60 text-sm">
              Available balance
            </span>
            <span className="text-lg font-bold">
              {formatCurrency(limit - spent, currency)}
            </span>
          </div>
        </div>
      </div>

      <CardSpending card={card} />

      {onToggleFreeze && (
        <CardActions card={card} onToggleFreeze={onToggleFreeze} />
      )}
    </div>
  );
};

export default CardDetail;
