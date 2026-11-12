import { FC, useRef, useState, useCallback } from 'react';
import type { Transaction } from '@/exhibit/types/wallet';
import { formatCurrency, formatDateTime } from '@/exhibit/lib/wallet/format';
import { getTransactionIcon } from '@/exhibit/lib/wallet/iconMap';
import { FiTrash2, FiArchive } from 'react-icons/fi';
import { useHaptic } from '@/exhibit/hooks/wallet/useHaptic';

interface SwipeableTransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

const SwipeableTransactionItem: FC<SwipeableTransactionItemProps> = ({
  transaction: tx,
  showDate = true,
  onDelete,
  onArchive,
}) => {
  const Icon = getTransactionIcon(tx.category);
  const { vibrate } = useHaptic();
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping) return;
      touchCurrentX.current = e.touches[0].clientX;
      const delta = touchCurrentX.current - touchStartX.current;
      setOffsetX(Math.max(-120, Math.min(0, delta < 0 ? delta : 0)));
    },
    [swiping]
  );

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    if (offsetX < -60) {
      vibrate('light');
      setOffsetX(-120);
    } else {
      setOffsetX(0);
    }
  }, [offsetX, vibrate]);

  const handleDelete = () => {
    vibrate('medium');
    onDelete?.(tx.id);
    setOffsetX(0);
  };

  const handleArchive = () => {
    vibrate('light');
    onArchive?.(tx.id);
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons behind */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          className="bg-info flex w-16 items-center justify-center text-white"
          onClick={handleArchive}
          aria-label="Archive transaction">
          <FiArchive className="text-xl" />
        </button>
        <button
          className="bg-error flex w-16 items-center justify-center text-white"
          onClick={handleDelete}
          aria-label="Delete transaction">
          <FiTrash2 className="text-xl" />
        </button>
      </div>

      {/* Content */}
      <div
        className="bg-base-200 relative flex items-center justify-between rounded-xl p-4"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        <div className="flex items-center gap-3">
          <Icon className="text-primary text-2xl" />
          <div>
            <p className="font-medium">{tx.title}</p>
            <p className="text-base-content/60 text-xs">
              {tx.category}
              {showDate && ` · ${formatDateTime(tx.date)}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-semibold ${
              tx.amount >= 0 ? 'text-success' : 'text-error'
            }`}>
            {tx.amount >= 0 ? '+' : ''}
            {formatCurrency(tx.amount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwipeableTransactionItem;
