'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiCheck } from 'react-icons/fi';

interface Plan {
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  current?: boolean;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthly: 0,
    yearly: 0,
    description: 'For side projects and experiments.',
    features: ['1 project', '1,000 requests / mo', 'Community support'],
    current: true,
  },
  {
    name: 'Pro',
    monthly: 19,
    yearly: 15,
    description: 'For growing teams that ship.',
    features: [
      'Unlimited projects',
      '100k requests / mo',
      'Priority support',
      'Custom domains',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    monthly: 99,
    yearly: 79,
    description: 'For large organizations.',
    features: ['SSO & SCIM', 'Dedicated support', '99.99% uptime SLA'],
  },
];

export const PricingTemplate: FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/auth/sign-in" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="btn btn-primary btn-sm">
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-24">
        <div className="mb-12 text-center">
          <span className="badge badge-neutral mb-6 rounded-full">Pricing</span>
          <h1 className="text-4xl md:text-5xl">Simple, transparent pricing</h1>
          <p className="text-base-content/60 mt-4 text-sm">
            Start free, upgrade when you grow.
          </p>
          <div className="mt-6 inline-flex items-center gap-2">
            <span
              className={annual ? 'text-base-content/50 text-sm' : 'text-sm'}>
              Monthly
            </span>
            <input
              type="checkbox"
              checked={annual}
              onChange={(e) => setAnnual(e.target.checked)}
              aria-label="Billing annually"
              className="toggle toggle-primary toggle-sm"
            />
            <span
              className={annual ? 'text-sm' : 'text-base-content/50 text-sm'}>
              Annual
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = annual ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.name}
                className={`card ${
                  plan.featured ? 'border-primary' : 'border-base-content/10'
                } bg-base-200 border`}>
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    {plan.current && (
                      <span className="badge badge-primary badge-sm">
                        Current plan
                      </span>
                    )}
                  </div>
                  <p className="text-base-content/50 text-sm">
                    {plan.description}
                  </p>
                  <p className="mt-2 text-3xl font-light">
                    ${price}
                    <span className="text-base-content/50 text-sm font-normal">
                      /mo{annual ? ' billed yearly' : ''}
                    </span>
                  </p>
                  <ul className="mt-4 flex flex-col gap-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <FiCheck className="text-success h-4 w-4 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`btn mt-6 ${
                      plan.featured ? 'btn-primary' : 'btn-outline'
                    }`}>
                    {plan.current ? 'Manage plan' : `Choose ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/landing/privacy"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Privacy
            </Link>
            <Link
              href="/landing/terms"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Terms
            </Link>
            <Link
              href="/landing/contact"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

PricingTemplate.displayName = 'PricingTemplate';
