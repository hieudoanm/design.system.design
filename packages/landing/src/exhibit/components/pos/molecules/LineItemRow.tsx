import { type FC } from 'react';
import { Money } from '@/exhibit/components/pos/atoms';
import type { CartItem } from '@/exhibit/types/pos';

interface LineItemRowProps {
  cartItem: CartItem;
  separator?: 'x' | '×';
}

export const LineItemRow: FC<LineItemRowProps> = ({
  cartItem,
  separator = 'x',
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">
      {cartItem.item.name} {separator}
      {cartItem.quantity}
    </span>
    <Money
      amount={cartItem.item.price * cartItem.quantity}
      className="text-sm font-bold"
    />
  </div>
);
