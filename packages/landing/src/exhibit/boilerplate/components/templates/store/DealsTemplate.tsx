'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiCheck, FiChevronRight, FiShoppingCart, FiTag } from 'react-icons/fi';

interface Deal {
  id: string;
  title: string;
  discount: number;
  priceBefore: number;
  priceAfter: number;
  expires: string;
}

const initialDeals: Deal[] = [
  {
    id: '1',
    title: 'Ergonomic Chair',
    discount: 40,
    priceBefore: 349,
    priceAfter: 209,
    expires: 'Aug 20, 2026',
  },
  {
    id: '2',
    title: 'Mechanical Keyboard',
    discount: 25,
    priceBefore: 159,
    priceAfter: 119,
    expires: 'Aug 15, 2026',
  },
  {
    id: '3',
    title: 'Studio Headphones',
    discount: 30,
    priceBefore: 249,
    priceAfter: 174,
    expires: 'Aug 31, 2026',
  },
  {
    id: '4',
    title: 'Wireless Mouse',
    discount: 15,
    priceBefore: 79,
    priceAfter: 67,
    expires: 'Aug 12, 2026',
  },
];

export const DealsTemplate: FC = () => {
  const [claimed, setClaimed] = useState<string[]>([]);

  const claimDeal = (id: string) =>
    setClaimed((prev) => (prev.includes(id) ? prev : [...prev, id]));

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

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/store"
              className="text-base-content/50 hover:text-primary transition-colors">
              Store
            </Link>
            <FiChevronRight className="text-base-content/30 h-3 w-3" />
            <span>Deals</span>
          </div>
          <span className="badge badge-primary badge-sm">
            {claimed.length} deals claimed
          </span>
        </div>

        <div className="mb-8">
          <h2>On sale now</h2>
          <p className="text-base-content/50 mt-1 text-sm">
            Limited-time promotions. Claim before they expire.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {initialDeals.map((deal) => {
            const isClaimed = claimed.includes(deal.id);
            return (
              <div
                key={deal.id}
                className="border-base-content/10 bg-base-200 flex flex-col rounded-xl border p-5">
                <div className="flex items-center justify-between">
                  <span className="text-primary text-2xl font-bold">
                    {deal.discount}% OFF
                  </span>
                  <FiTag className="text-base-content/30 h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-medium">{deal.title}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-bold">
                    ${deal.priceAfter}
                  </span>
                  <span className="text-base-content/30 text-sm line-through">
                    ${deal.priceBefore}
                  </span>
                </div>
                <p className="text-base-content/50 mt-1 text-xs">
                  Ends {deal.expires}
                </p>
                <button
                  type="button"
                  onClick={() => claimDeal(deal.id)}
                  disabled={isClaimed}
                  className="btn btn-primary btn-sm mt-4 w-full gap-1">
                  {isClaimed && <FiCheck className="h-3 w-3" />}
                  {isClaimed ? 'Claimed' : 'Claim deal'}
                </button>
              </div>
            );
          })}
        </div>
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

DealsTemplate.displayName = 'DealsTemplate';
