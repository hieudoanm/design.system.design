import type { FC } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
}

interface WishlistViewProps {
  items: WishlistItem[];
  onRemove?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export const WishlistView: FC<WishlistViewProps> = ({
  items,
  onRemove,
  onAddToCart,
}) => {
  if (items.length === 0) {
    return (
      <section data-testid="wishlist-view" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">Your wishlist is empty</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="wishlist-view" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Wishlist</h2>
        <span className="badge badge-ghost">{items.length} items</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="card bg-base-200">
            <div className="card-body gap-3">
              <div className="flex items-center justify-between">
                <div className="avatar placeholder">
                  <div className="bg-accent text-accent-content w-10 rounded-lg">
                    <span>{item.name.charAt(0)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => onRemove?.(item.id)}>
                  &#10005;
                </button>
              </div>
              <h3 className="text-sm font-medium">{item.name}</h3>
              <p className="text-base font-semibold">
                ${item.price.toFixed(2)}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onAddToCart?.(item.id)}>
                Move to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
