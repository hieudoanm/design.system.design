'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiShoppingCart,
  FiStar,
  FiMinus,
  FiPlus,
  FiChevronRight,
  FiPackage,
  FiTag,
} from 'react-icons/fi';

interface Review {
  author: string;
  initials: string;
  rating: number;
  date: string;
  body: string;
}

const product = {
  id: '2',
  name: 'Mechanical Keyboard',
  category: 'Electronics',
  price: 159,
  rating: 4.8,
  reviewCount: 94,
};

const reviews: Review[] = [
  {
    author: 'Alex Rivera',
    initials: 'AR',
    rating: 5,
    date: '2 weeks ago',
    body: 'Best keyboard I have ever used. The switches are incredibly smooth and the build quality is outstanding.',
  },
  {
    author: 'Jordan Lee',
    initials: 'JL',
    rating: 5,
    date: '1 month ago',
    body: 'Great for both work and gaming. The hot-swappable switches make it easy to customize.',
  },
  {
    author: 'Morgan Patel',
    initials: 'MP',
    rating: 4,
    date: '2 months ago',
    body: 'Solid keyboard with a premium feel. Only giving 4 stars because I wish it came with USB-C instead of mini-USB.',
  },
  {
    author: 'Sam Thompson',
    initials: 'ST',
    rating: 5,
    date: '3 months ago',
    body: 'Upgraded from a membrane keyboard and the difference is night and day. Typing feels effortless now.',
  },
];

const StarRating: FC<{ rating: number; size?: 'sm' | 'md' }> = ({
  rating,
  size = 'sm',
}) => (
  <span className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={
          i < Math.floor(rating)
            ? `fill-warning text-warning ${size === 'md' ? 'h-4 w-4' : 'h-3 w-3'}`
            : `text-base-content/20 ${size === 'md' ? 'h-4 w-4' : 'h-3 w-3'}`
        }
      />
    ))}
  </span>
);

interface StoreItemTemplateProps {
  cartCount?: number;
}

export const StoreItemTemplate: FC<StoreItemTemplateProps> = ({
  cartCount = 2,
}) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Custom Header (matches StoreFrontTemplate) ── */}
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <nav className="flex items-center gap-1">
          <button className="btn btn-ghost btn-sm relative">
            <FiShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="badge badge-error badge-xs absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] p-0 text-[10px]">
                {cartCount}
              </span>
            )}
          </button>
          <Link href="/auth/sign-in" className="btn btn-primary btn-sm ml-1">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-base-content/50 mb-8 flex items-center gap-2 text-sm">
          <Link href="/store" className="hover:text-primary transition-colors">
            Store
          </Link>
          <FiChevronRight className="h-3 w-3" />
          <span className="text-base-content">{product.name}</span>
        </div>

        {/* Product detail */}
        <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="bg-base-200 border-base-content/10 flex h-72 items-center justify-center rounded-2xl border lg:h-96">
            <FiPackage className="text-base-content/20 h-20 w-20" />
          </div>

          <div>
            <p className="text-base-content/40 mb-2 text-xs tracking-wider uppercase">
              {product.category}
            </p>
            <h1 className="mb-3 text-2xl lg:text-3xl">{product.name}</h1>

            <div className="mb-4 flex items-center gap-3">
              <StarRating rating={product.rating} size="md" />
              <span className="text-base-content/40 text-sm">
                ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold">${product.price}</span>
            </div>

            <p className="text-base-content/60 mb-8 text-sm leading-relaxed">
              Precision-engineered for peak productivity. Features hot-swappable
              mechanical switches, per-key RGB backlighting, and a compact
              tenkeyless layout.
            </p>

            {/* Quantity */}
            <div className="mb-6 flex items-center gap-4">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}>
                  <FiMinus className="h-3 w-3" />
                </button>
                <span className="join-item flex min-w-[3rem] items-center justify-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setQuantity(quantity + 1)}>
                  <FiPlus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <button className="btn btn-primary w-full lg:w-auto lg:px-12">
              Add to cart &mdash; ${product.price * quantity}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl">Customer reviews</h2>
          <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6 lg:p-8">
            <div className="flex flex-col gap-6">
              {reviews.map((review) => (
                <div
                  key={review.author}
                  className="border-base-content/10 border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium">
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-base-content/30 text-xs">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-base-content/60 text-sm leading-relaxed">
                    {review.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
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

StoreItemTemplate.displayName = 'StoreItemTemplate';
