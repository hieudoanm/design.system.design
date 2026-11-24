'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiCheck,
  FiChevronRight,
  FiHelpCircle,
  FiMapPin,
  FiPhone,
  FiShoppingCart,
} from 'react-icons/fi';

interface TrackingStep {
  label: string;
  status: 'done' | 'current' | 'pending';
}

const steps: TrackingStep[] = [
  { label: 'Processing', status: 'done' },
  { label: 'Shipped', status: 'done' },
  { label: 'Out for delivery', status: 'current' },
  { label: 'Delivered', status: 'pending' },
];

const order = {
  id: 'ORD-2026-0174',
  placed: 'Aug 2, 2026',
  total: 746,
};

const StepIcon: FC<{ status: TrackingStep['status'] }> = ({ status }) => {
  if (status === 'done') {
    return (
      <span className="bg-success text-success-content flex h-8 w-8 items-center justify-center rounded-full">
        <FiCheck className="h-4 w-4" />
      </span>
    );
  }
  if (status === 'current') {
    return (
      <span className="bg-primary text-primary-content flex h-8 w-8 items-center justify-center rounded-full">
        <span className="loading loading-spinner loading-sm" />
      </span>
    );
  }
  return (
    <span className="border-base-content/20 bg-base-200 h-8 w-8 rounded-full border" />
  );
};

export const OrderTrackingTemplate: FC = () => {
  const [showMap, setShowMap] = useState(false);

  const completed = steps.filter((step) => step.status !== 'pending').length;
  const percent = Math.round((completed / steps.length) * 100);

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

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/store"
            className="text-base-content/50 hover:text-primary transition-colors">
            Store
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <Link
            href="/store/order-history"
            className="text-base-content/50 hover:text-primary transition-colors">
            Orders
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <span>Tracking</span>
        </div>

        <div className="border-base-content/10 bg-base-200 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
          <div>
            <p className="text-base-content/50 text-xs tracking-wider uppercase">
              Order
            </p>
            <p className="text-lg font-bold">{order.id}</p>
          </div>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-base-content/50 text-xs">Placed</p>
              <p className="text-sm font-medium">{order.placed}</p>
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Total</p>
              <p className="text-sm font-medium">${order.total}</p>
            </div>
            <button
              onClick={() => setShowMap((prev) => !prev)}
              className="btn btn-outline btn-sm gap-1">
              <FiMapPin className="h-3 w-3" />
              Track on map
            </button>
          </div>
        </div>

        {showMap && (
          <div className="bg-warning/10 text-warning mb-8 flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
            <FiMapPin className="h-4 w-4" />
            Map preview not available offline
          </div>
        )}

        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-base-content/50">Progress</span>
            <span className="font-medium">{percent}%</span>
          </div>
          <div className="bg-base-200 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className="relative flex gap-4 pb-8 last:pb-0">
              {index < steps.length - 1 && (
                <span className="border-base-content/20 absolute top-6 left-4 h-full border-l-2" />
              )}
              <div className="flex flex-col items-center">
                <StepIcon status={step.status} />
              </div>
              <div className="pt-1">
                <p className="text-sm font-medium">{step.label}</p>
                {step.status === 'current' && (
                  <span className="badge badge-primary badge-sm mt-1">
                    In transit
                  </span>
                )}
                {step.status === 'pending' && (
                  <span className="badge badge-ghost badge-sm mt-1">
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="#" className="btn btn-outline btn-sm gap-1">
            <FiPhone className="h-3 w-3" />
            Contact courier
          </Link>
          <Link href="#" className="btn btn-ghost btn-sm gap-1">
            <FiHelpCircle className="h-3 w-3" />
            Need help?
          </Link>
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

OrderTrackingTemplate.displayName = 'OrderTrackingTemplate';
