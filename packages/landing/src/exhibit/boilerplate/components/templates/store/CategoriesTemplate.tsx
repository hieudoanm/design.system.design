'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiChevronDown, FiChevronRight, FiShoppingCart } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  count: number;
  products: string[];
}

const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    count: 24,
    products: ['Wireless Mouse', 'Mechanical Keyboard', 'USB-C Hub'],
  },
  {
    id: '2',
    name: 'Audio',
    count: 18,
    products: ['Studio Headphones', 'Bluetooth Speaker', 'Condenser Mic'],
  },
  {
    id: '3',
    name: 'Furniture',
    count: 12,
    products: ['Ergonomic Chair', 'Standing Desk', 'Bookshelf'],
  },
  {
    id: '4',
    name: 'Accessories',
    count: 9,
    products: ['Laptop Sleeve', 'Cable Organizer', 'Monitor Stand'],
  },
];

export const CategoriesTemplate: FC = () => {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = initialCategories.filter((category) =>
    category.name.toLowerCase().includes(normalized)
  );

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

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
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/store"
              className="text-base-content/50 hover:text-primary transition-colors">
              Store
            </Link>
            <FiChevronRight className="text-base-content/30 h-3 w-3" />
            <span>Categories</span>
          </div>
          <input
            type="search"
            placeholder="Search categories"
            aria-label="Search categories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input input-bordered input-sm w-full sm:w-64"
          />
        </div>

        <div className="mb-6">
          <h2>Browse categories</h2>
          <p className="text-base-content/50 mt-1 text-sm">
            {filtered.length} categories
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 rounded-xl border py-16 text-center">
            <p className="text-base-content/50 text-sm">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((category) => {
              const isOpen = expandedId === category.id;
              return (
                <div
                  key={category.id}
                  className="border-base-content/10 bg-base-200 rounded-xl border p-4">
                  <button
                    type="button"
                    onClick={() => toggle(category.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 text-left">
                    <span>
                      <span className="block text-sm font-medium">
                        {category.name}
                      </span>
                      <span className="text-base-content/50 mt-0.5 block text-xs">
                        {category.count} items
                      </span>
                    </span>
                    <FiChevronDown
                      className={`text-base-content/40 h-4 w-4 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <ul className="mt-3 list-disc border-t pt-3 pl-4">
                      {category.products.map((product) => (
                        <li
                          key={product}
                          className="text-base-content/60 text-xs">
                          {product}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
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

CategoriesTemplate.displayName = 'CategoriesTemplate';
