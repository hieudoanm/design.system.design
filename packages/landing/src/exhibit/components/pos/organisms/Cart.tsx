import { type FC } from 'react';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { EmptyState, Money } from '@/exhibit/components/pos/atoms';
import { MoneyRow } from '@/exhibit/components/pos/molecules';
import { calculateSubtotal } from '@/exhibit/lib/pos';
import type { CartItem } from '@/exhibit/types/pos';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
}

export const Cart: FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-sm font-bold">Cart</h2>
    {items.length === 0 ? (
      <EmptyState>Cart is empty</EmptyState>
    ) : (
      <>
        <div className="flex flex-col gap-2">
          {items.map((ci) => (
            <CartLine
              key={ci.item.id}
              cartItem={ci}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </div>
        <div className="border-base-300 border-t pt-3">
          <MoneyRow
            label="Subtotal"
            amount={calculateSubtotal(items)}
            tone="primary"
          />
        </div>
        <button onClick={onCheckout} className="btn btn-primary btn-sm w-full">
          Checkout
        </button>
      </>
    )}
  </div>
);

interface CartLineProps {
  cartItem: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

const CartLine: FC<CartLineProps> = ({
  cartItem,
  onUpdateQuantity,
  onRemove,
}) => (
  <div className="border-base-300 bg-base-200 flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
    <div className="flex flex-col">
      <span className="text-sm font-bold">{cartItem.item.name}</span>
      <Money amount={cartItem.item.price} className="text-primary text-xs" />
    </div>
    <div className="flex items-center gap-1">
      <button
        onClick={() =>
          onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)
        }
        className="btn btn-ghost btn-xs">
        <FiMinus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center text-sm font-bold">
        {cartItem.quantity}
      </span>
      <button
        onClick={() =>
          onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)
        }
        className="btn btn-ghost btn-xs">
        <FiPlus className="h-3 w-3" />
      </button>
      <button
        onClick={() => onRemove(cartItem.item.id)}
        className="btn btn-ghost btn-xs text-error">
        <FiTrash2 className="h-3 w-3" />
      </button>
    </div>
  </div>
);
