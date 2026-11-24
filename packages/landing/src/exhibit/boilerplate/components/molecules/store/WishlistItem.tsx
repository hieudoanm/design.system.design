import type { FC } from 'react';

interface WishlistItemProps {
  name: string;
  price: number;
  addedDate?: string;
  currency?: string;
  onAddToCart?: () => void;
  onRemove?: () => void;
}

export const WishlistItem: FC<WishlistItemProps> = ({
  name,
  price,
  addedDate,
  currency = '$',
  onAddToCart,
  onRemove,
}) => (
  <div
    className="border-base-300 flex items-center justify-between gap-4 border-b py-3"
    data-testid="wishlist-item">
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">{name}</span>
      <span
        className="text-base-content/60 text-sm"
        data-testid="wishlist-price">
        {currency}
        {price.toFixed(2)}
        {addedDate && ` · Added ${addedDate}`}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {onAddToCart && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAddToCart}>
          Add to cart
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-label={`Remove ${name}`}
          onClick={onRemove}>
          ✕
        </button>
      )}
    </div>
  </div>
);
