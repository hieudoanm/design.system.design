import type { FC } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiCheck, FiShoppingCart, FiChevronRight } from 'react-icons/fi';

export const OrderConfirmationTemplate: FC = () => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Boilerplate
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/store/cart" className="btn btn-ghost btn-sm relative">
          <FiShoppingCart className="h-4 w-4" />
        </Link>
        <Link href="/auth/sign-in" className="btn btn-primary btn-sm">
          Sign in
        </Link>
      </div>
    </header>

    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <div className="mb-8 flex items-center gap-2 text-sm">
        <Link
          href="/store"
          className="text-base-content/50 hover:text-primary transition-colors">
          Store
        </Link>
        <FiChevronRight className="text-base-content/30 h-3 w-3" />
        <span>Order confirmed</span>
      </div>

      <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-6 rounded-2xl border p-12 text-center">
        <div className="bg-success/10 text-success flex h-20 w-20 items-center justify-center rounded-full">
          <FiCheck className="h-10 w-10" />
        </div>
        <div>
          <h1 className="mb-2 text-2xl">Order confirmed!</h1>
          <p className="text-base-content/50 text-sm">
            Thank you, Jane! Your order{' '}
            <span className="text-base-content font-medium">
              #ORD-2024-3847
            </span>{' '}
            has been placed.
          </p>
        </div>
      </div>

      <div className="border-base-content/10 bg-base-200 mt-6 rounded-2xl border p-6">
        <h2 className="mb-4 text-sm font-medium">Order details</h2>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/50">Status</span>
            <span className="badge badge-success badge-sm">Processing</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/50">Estimated delivery</span>
            <span>Feb 5&ndash;7, 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/50">Payment</span>
            <span>Visa ending in 4242</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/50">Shipping</span>
            <span className="text-success">Free</span>
          </div>
          <div className="border-base-content/10 border-t" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>$746</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/store" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link href="/store/order-history" className="btn btn-ghost">
          View orders
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

OrderConfirmationTemplate.displayName = 'OrderConfirmationTemplate';
