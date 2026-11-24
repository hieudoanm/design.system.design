'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { FiPlus, FiToggleRight } from 'react-icons/fi';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  usage: number;
  limit: number;
  active: boolean;
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp1',
    code: 'SAVE10',
    discount: 10,
    usage: 42,
    limit: 100,
    active: true,
  },
  {
    id: 'cp2',
    code: 'WELCOME15',
    discount: 15,
    usage: 100,
    limit: 100,
    active: true,
  },
  {
    id: 'cp3',
    code: 'FLASH20',
    discount: 20,
    usage: 12,
    limit: 50,
    active: false,
  },
  {
    id: 'cp4',
    code: 'VIP30',
    discount: 30,
    usage: 3,
    limit: 100,
    active: false,
  },
];

export const CouponsTemplate: FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    const parsedDiscount = Number(discount);
    if (
      !trimmedCode ||
      Number.isNaN(parsedDiscount) ||
      parsedDiscount < 1 ||
      parsedDiscount > 99
    ) {
      setMessage('Enter a code and a discount between 1 and 99');
      return;
    }
    setCoupons((prev) => [
      ...prev,
      {
        id: `cp${Date.now()}`,
        code: trimmedCode,
        discount: parsedDiscount,
        usage: 0,
        limit: 100,
        active: true,
      },
    ]);
    setCode('');
    setDiscount('');
    setMessage('Coupon added');
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.id === id ? { ...coupon, active: !coupon.active } : coupon
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Create and manage discount codes.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="coupon-code" className="text-sm font-medium">
                  Code
                </label>
                <input
                  id="coupon-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SAVE10"
                  aria-label="Coupon code"
                  className="input input-bordered input-sm w-40"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="coupon-discount"
                  className="text-sm font-medium">
                  Discount
                </label>
                <input
                  id="coupon-discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="10"
                  aria-label="Discount %"
                  className="input input-bordered input-sm w-32"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm gap-1">
                <FiPlus />
                Add coupon
              </button>
            </form>
            {message === 'Enter a code and a discount between 1 and 99' && (
              <p className="text-error text-sm" role="alert">
                Enter a code and a discount between 1 and 99
              </p>
            )}
            {message === 'Coupon added' && (
              <p className="text-success text-sm">Coupon added</p>
            )}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Uses</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 font-mono text-sm">
                        {coupon.code}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {coupon.discount}% off
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {coupon.usage}/{coupon.limit} uses
                      </td>
                      <td className="px-4 py-3">
                        {coupon.active ? (
                          <span className="badge badge-success badge-sm">
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-neutral badge-sm">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleCoupon(coupon.id)}
                          className="btn btn-ghost btn-xs gap-1">
                          <FiToggleRight />
                          Toggle
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

CouponsTemplate.displayName = 'CouponsTemplate';
