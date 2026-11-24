'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiSearch,
  FiShoppingCart,
  FiArrowRight,
  FiStar,
  FiTag,
} from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Ergonomic Chair',
    category: 'Furniture',
    price: 349,
    originalPrice: 429,
    rating: 4.5,
    reviewCount: 128,
    badge: 'Sale',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 159,
    rating: 4.8,
    reviewCount: 94,
    badge: 'Best seller',
  },
  {
    id: '3',
    name: 'Studio Headphones',
    category: 'Audio',
    price: 89,
    rating: 4.3,
    reviewCount: 215,
    badge: 'New',
  },
  {
    id: '4',
    name: 'Minimal Desk Lamp',
    category: 'Furniture',
    price: 59,
    rating: 4.6,
    reviewCount: 73,
  },
  {
    id: '5',
    name: 'Wireless Mouse',
    category: 'Electronics',
    price: 79,
    rating: 4.4,
    reviewCount: 186,
  },
  {
    id: '6',
    name: 'Canvas Backpack',
    category: 'Accessories',
    price: 129,
    originalPrice: 159,
    rating: 4.7,
    reviewCount: 52,
    badge: 'Sale',
  },
  {
    id: '7',
    name: 'Ceramic Mug Set',
    category: 'Accessories',
    price: 34,
    rating: 4.2,
    reviewCount: 309,
    badge: 'Eco',
  },
  {
    id: '8',
    name: 'Laptop Stand',
    category: 'Furniture',
    price: 69,
    rating: 4.1,
    reviewCount: 98,
  },
  {
    id: '9',
    name: 'USB-C Hub',
    category: 'Electronics',
    price: 45,
    rating: 4.0,
    reviewCount: 144,
  },
  {
    id: '10',
    name: 'Desk Mat',
    category: 'Accessories',
    price: 39,
    rating: 4.9,
    reviewCount: 67,
    badge: 'Premium',
  },
  {
    id: '11',
    name: 'Portable Speaker',
    category: 'Audio',
    price: 119,
    originalPrice: 149,
    rating: 4.6,
    reviewCount: 231,
    badge: 'Sale',
  },
  {
    id: '12',
    name: 'LED Monitor 27"',
    category: 'Electronics',
    price: 449,
    rating: 4.7,
    reviewCount: 412,
    badge: 'Popular',
  },
];

const categories = ['All', 'Furniture', 'Electronics', 'Audio', 'Accessories'];

const StarRating: FC<{ rating: number }> = ({ rating }) => (
  <span className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={
          i < Math.floor(rating)
            ? 'fill-warning text-warning h-3 w-3'
            : 'text-base-content/20 h-3 w-3'
        }
      />
    ))}
    <span className="text-base-content/40 ml-0.5 text-xs">
      ({rating.toFixed(1)})
    </span>
  </span>
);

const ProductCard: FC<{ product: Product }> = ({ product }) => (
  <Link
    href={`/store/${product.id}`}
    className="border-base-content/10 bg-base-200 hover:border-primary/50 group flex flex-col rounded-xl border transition-colors">
    <div className="bg-base-300 flex h-40 items-center justify-center rounded-t-xl">
      <FiTag className="text-base-content/20 h-10 w-10" />
    </div>
    <div className="flex flex-1 flex-col gap-2 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base-content/40 text-xs">{product.category}</p>
          <h3 className="mt-0.5 text-sm font-medium">{product.name}</h3>
        </div>
        {product.badge && (
          <span className="badge badge-primary badge-xs shrink-0">
            {product.badge}
          </span>
        )}
      </div>
      <StarRating rating={product.rating} />
      <div className="mt-auto flex items-center gap-2">
        <span className="text-base font-bold">${product.price}</span>
        {product.originalPrice && (
          <span className="text-base-content/30 text-sm line-through">
            ${product.originalPrice}
          </span>
        )}
      </div>
    </div>
  </Link>
);

export const StoreFrontTemplate: FC<{ cartCount?: number }> = ({
  cartCount = 2,
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Custom Header ── */}
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <nav className="flex items-center gap-1">
          <button className="btn btn-ghost btn-sm">
            <FiSearch className="h-4 w-4" />
          </button>
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

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-primary mb-4 text-xs tracking-[0.2em] uppercase">
            Spring collection &middot; Free shipping
          </p>
          <h1 className="mb-6 text-4xl md:text-6xl">
            Workspace essentials
            <br />
            <span className="text-primary">curated for you</span>
          </h1>
          <p className="text-base-content/50 mx-auto mb-10 max-w-xl text-sm leading-relaxed">
            Thoughtfully designed tools and accessories for your everyday
            workflow. From ergonomic furniture to premium audio.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#products" className="btn btn-primary">
              Shop now <FiArrowRight />
            </a>
            <a href="#deals" className="btn btn-ghost">
              View deals &rarr;
            </a>
          </div>
        </section>

        <div className="border-base-content/10 mx-6 border-t" />

        {/* ── Products ── */}
        <section id="products" className="mx-auto max-w-5xl px-6 py-24">
          <p className="text-primary mb-3 text-xs tracking-[0.2em] uppercase">
            Products
          </p>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl">Browse all</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn btn-sm ${
                    activeCategory === cat ? 'btn-primary' : 'btn-ghost'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <div className="border-base-content/10 mx-6 border-t" />

        {/* ── Deals ── */}
        <section id="deals" className="mx-auto max-w-5xl px-6 py-24">
          <p className="text-primary mb-3 text-xs tracking-[0.2em] uppercase">
            Deals
          </p>
          <h2 className="mb-8 text-2xl">On sale now</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((p) => p.originalPrice)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>

        <div className="border-base-content/10 mx-6 border-t" />

        {/* ── Newsletter ── */}
        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="border-base-content/10 bg-base-200 rounded-2xl border">
            <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <h2 className="text-2xl">Stay in the loop</h2>
              <p className="text-base-content/50 max-w-md text-sm">
                Get early access to new products, exclusive deals, and workspace
                inspiration.
              </p>
              <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="jane@example.com"
                  className="input input-bordered flex-1"
                />
                <button className="btn btn-primary">Subscribe</button>
              </div>
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

StoreFrontTemplate.displayName = 'StoreFrontTemplate';
