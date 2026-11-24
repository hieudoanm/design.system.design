'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPower } from 'react-icons/fi';

type PromotionStatus = 'Active' | 'Ended' | 'Scheduled';
type PromotionFilter = 'All' | PromotionStatus;

interface Promotion {
  id: string;
  name: string;
  discount: string;
  budget: number;
  spent: number;
  status: PromotionStatus;
}

const PROMOTIONS: Promotion[] = [
  {
    id: 'pr1',
    name: 'Spring Sale',
    discount: '25% off',
    budget: 5000,
    spent: 3200,
    status: 'Active',
  },
  {
    id: 'pr2',
    name: 'Summer Launch',
    discount: '15% off',
    budget: 3000,
    spent: 3000,
    status: 'Active',
  },
  {
    id: 'pr3',
    name: 'Flash Friday',
    discount: '40% off',
    budget: 1000,
    spent: 0,
    status: 'Scheduled',
  },
  {
    id: 'pr4',
    name: 'Holiday Extravaganza',
    discount: '30% off',
    budget: 8000,
    spent: 8000,
    status: 'Ended',
  },
  {
    id: 'pr5',
    name: 'Refer-a-Friend',
    discount: '10% off',
    budget: 2000,
    spent: 500,
    status: 'Ended',
  },
];

const FILTERS: PromotionFilter[] = ['All', 'Active', 'Ended', 'Scheduled'];

const getStatusBadge = (status: PromotionStatus) => {
  switch (status) {
    case 'Active':
      return <span className="badge badge-success badge-sm">Active</span>;
    case 'Scheduled':
      return <span className="badge badge-info badge-sm">Scheduled</span>;
    default:
      return <span className="badge badge-neutral badge-sm">Ended</span>;
  }
};

export const PromotionsTemplate: FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS);
  const [filter, setFilter] = useState<PromotionFilter>('All');

  const visible = promotions.filter(
    (promo) => filter === 'All' || promo.status === filter
  );

  const endPromotion = (id: string) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === id ? { ...promo, status: 'Ended' } : promo
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track campaign spend and status.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`tab ${filter === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Campaign</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Spend</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((promo) => (
                    <tr
                      key={promo.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {promo.name}
                      </td>
                      <td className="px-4 py-3 text-sm">{promo.discount}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">
                            ${promo.spent.toLocaleString()}
                          </span>
                          <progress
                            className="progress progress-primary w-full"
                            value={promo.spent}
                            max={promo.budget}
                            aria-label={`Progress for ${promo.name}`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${promo.budget.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(promo.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {promo.status === 'Active' && (
                          <button
                            onClick={() => endPromotion(promo.id)}
                            className="btn btn-outline btn-sm gap-1">
                            <FiPower />
                            End promotion
                          </button>
                        )}
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

PromotionsTemplate.displayName = 'PromotionsTemplate';
