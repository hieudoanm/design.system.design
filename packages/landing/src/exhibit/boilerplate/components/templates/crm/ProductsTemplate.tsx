'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

type ProductStatus = 'Active' | 'Draft';
type ProductFilter = 'All' | ProductStatus;

interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  status: ProductStatus;
}

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Ergonomic Chair',
    sku: 'CH-001',
    price: '$349.00',
    stock: 24,
    status: 'Active',
  },
  {
    id: 'p2',
    name: 'Mechanical Keyboard',
    sku: 'KB-002',
    price: '$129.00',
    stock: 15,
    status: 'Active',
  },
  {
    id: 'p3',
    name: 'Studio Headphones',
    sku: 'HP-003',
    price: '$249.00',
    stock: 8,
    status: 'Active',
  },
  {
    id: 'p4',
    name: 'Wireless Mouse',
    sku: 'MS-004',
    price: '$59.00',
    stock: 32,
    status: 'Active',
  },
  {
    id: 'p5',
    name: 'Desk Lamp',
    sku: 'LM-005',
    price: '$79.00',
    stock: 0,
    status: 'Draft',
  },
  {
    id: 'p6',
    name: 'Monitor Stand',
    sku: 'MS-006',
    price: '$99.00',
    stock: 12,
    status: 'Draft',
  },
];

const FILTERS: ProductFilter[] = ['All', 'Active', 'Draft'];

export const ProductsTemplate: FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [filter, setFilter] = useState<ProductFilter>('All');

  const visible = products.filter(
    (product) => filter === 'All' || product.status === filter
  );
  const activeCount = visible.filter(
    (product) => product.status === 'Active'
  ).length;

  const toggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              status: product.status === 'Active' ? 'Draft' : 'Active',
            }
          : product
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Manage the product catalog.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {activeCount} active products
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((product) => (
                    <tr
                      key={product.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-sm">{product.sku}</td>
                      <td className="px-4 py-3 text-sm">{product.price}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        {product.status === 'Active' ? (
                          <span className="badge badge-success badge-sm">
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-neutral badge-sm">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleStatus(product.id)}
                          className="btn btn-ghost btn-xs gap-1">
                          {product.status === 'Active' ? <FiX /> : <FiCheck />}
                          {product.status === 'Active'
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

ProductsTemplate.displayName = 'ProductsTemplate';
