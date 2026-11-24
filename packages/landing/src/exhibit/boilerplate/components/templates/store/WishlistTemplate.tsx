'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiCheck,
  FiChevronRight,
  FiHeart,
  FiPackage,
  FiShoppingCart,
  FiX,
} from 'react-icons/fi';

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  category: string;
}

const initialProducts: WishlistProduct[] = [
  { id: '1', name: 'Ergonomic Chair', price: 349, category: 'Furniture' },
  { id: '2', name: 'Mechanical Keyboard', price: 159, category: 'Electronics' },
  { id: '3', name: 'Studio Headphones', price: 249, category: 'Audio' },
];

export const WishlistTemplate: FC = () => {
  const [products, setProducts] = useState(initialProducts);
  const [moved, setMoved] = useState<string[]>([]);

  const moveToCart = (name: string, id: string) => {
    setMoved((prev) => [...prev, name]);
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((item) => item.id !== id));

  const lastMoved = moved[moved.length - 1];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <Link href="/store/cart" className="btn btn-ghost btn-sm">
          <FiShoppingCart className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/store"
            className="text-base-content/50 hover:text-primary transition-colors">
            Store
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <span>Wishlist ({products.length})</span>
        </div>

        {moved.length > 0 && (
          <div className="bg-success/10 text-success mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
            <FiCheck className="h-4 w-4" />
            Added {lastMoved} to your cart
          </div>
        )}

        {products.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border py-24 text-center">
            <FiHeart className="text-base-content/20 h-12 w-12" />
            <p className="text-base-content/50 text-sm">
              Your wishlist is empty
            </p>
            <Link href="/store" className="btn btn-primary btn-sm">
              Browse store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border-base-content/10 bg-base-200 rounded-xl border p-4">
                <div className="bg-base-300 relative mb-3 flex h-32 items-center justify-center rounded-lg">
                  <FiPackage className="text-base-content/20 h-8 w-8" />
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="btn btn-ghost btn-xs text-error absolute top-1 right-1"
                    aria-label={`Remove ${product.name}`}>
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-base-content/40 text-xs tracking-wider uppercase">
                  {product.category}
                </p>
                <p className="mt-1 text-sm font-medium">{product.name}</p>
                <p className="text-base-content/50 text-sm">${product.price}</p>
                <button
                  onClick={() => moveToCart(product.name, product.id)}
                  className="btn btn-primary btn-sm mt-3 w-full gap-1">
                  <FiShoppingCart className="h-3 w-3" />
                  Move to cart
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-primary text-lg font-bold tracking-tight">
            Boilerplate
          </p>
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate Store &middot; Built
            with care
          </p>
        </div>
      </footer>
    </div>
  );
};

WishlistTemplate.displayName = 'WishlistTemplate';
