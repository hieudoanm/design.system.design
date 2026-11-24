'use client';

import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiCheck,
  FiChevronRight,
  FiShoppingCart,
  FiStar,
  FiX,
} from 'react-icons/fi';

interface CompareProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  stock: string;
  features: string[];
}

const PRODUCTS: Record<string, CompareProduct> = {
  '1': {
    id: '1',
    name: 'Ergonomic Chair',
    price: 349,
    rating: 4.7,
    stock: 'In stock',
    features: ['Adjustable height', 'Lumbar support', 'Breathable mesh'],
  },
  '2': {
    id: '2',
    name: 'Mechanical Keyboard',
    price: 159,
    rating: 4.8,
    stock: 'In stock',
    features: ['Hot-swap switches', 'RGB backlight', 'USB-C port'],
  },
  '3': {
    id: '3',
    name: 'Studio Headphones',
    price: 249,
    rating: 4.6,
    stock: 'Low stock',
    features: ['Noise cancelling', '40h battery', 'Bluetooth 5.3'],
  },
  '4': {
    id: '4',
    name: 'Wireless Mouse',
    price: 79,
    rating: 4.5,
    stock: 'Out of stock',
    features: ['Silent clicks', 'USB-C port', 'Ergonomic shape'],
  },
};

const initialIds = ['1', '2', '3'];

const stockColor = (stock: string) => {
  if (stock === 'Out of stock') return 'badge-error';
  if (stock === 'Low stock') return 'badge-warning';
  return 'badge-success';
};

export const CompareTemplate: FC = () => {
  const [selectedIds, setSelectedIds] = useState(initialIds);

  const selected = selectedIds.map((id) => PRODUCTS[id]);

  const available = Object.keys(PRODUCTS).filter(
    (id) => !selectedIds.includes(id)
  );

  const features = Array.from(
    new Set(selected.flatMap((product) => product.features))
  );

  const addProduct = (id: string) => setSelectedIds((prev) => [...prev, id]);

  const removeProduct = (id: string) =>
    setSelectedIds((prev) => prev.filter((item) => item !== id));

  const handleAdd = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) addProduct(id);
  };

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
            <span>Compare ({selected.length})</span>
          </div>
          <select
            value=""
            onChange={handleAdd}
            aria-label="Add product"
            className="select select-bordered select-sm">
            <option value="" disabled>
              Add product
            </option>
            {available.map((id) => (
              <option key={id} value={id}>
                {PRODUCTS[id].name}
              </option>
            ))}
          </select>
        </div>

        {selected.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border py-24 text-center">
            <FiShoppingCart className="text-base-content/20 h-12 w-12" />
            <p className="text-base-content/50 text-sm">
              Add products to start comparing
            </p>
          </div>
        ) : (
          <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  {selected.map((product) => (
                    <th key={product.id}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">
                          {product.name}
                        </span>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="btn btn-ghost btn-xs text-error"
                          aria-label={`Remove ${product.name}`}>
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-base-content/40 text-xs font-normal">
                        ${product.price}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content/50">Price</td>
                  {selected.map((product) => (
                    <td key={product.id}>${product.price}</td>
                  ))}
                </tr>
                <tr>
                  <td className="text-base-content/50">Rating</td>
                  {selected.map((product) => (
                    <td key={product.id}>
                      <span className="flex items-center gap-1">
                        <FiStar className="text-warning fill-warning h-3 w-3" />
                        {product.rating} / 5
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-base-content/50">Stock</td>
                  {selected.map((product) => (
                    <td key={product.id}>
                      <span
                        className={`badge badge-sm ${stockColor(product.stock)}`}>
                        {product.stock}
                      </span>
                    </td>
                  ))}
                </tr>
                {features.map((feature) => (
                  <tr key={feature}>
                    <td className="text-base-content/50">{feature}</td>
                    {selected.map((product) => (
                      <td key={product.id}>
                        {product.features.includes(feature) ? (
                          <FiCheck className="text-success h-4 w-4" />
                        ) : (
                          <FiX className="text-error h-4 w-4" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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

CompareTemplate.displayName = 'CompareTemplate';
