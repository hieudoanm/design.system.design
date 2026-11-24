'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiBookOpen,
  FiCreditCard,
  FiHelpCircle,
  FiSearch,
  FiSliders,
  FiUsers,
} from 'react-icons/fi';

interface FaqItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: FC<{ className?: string }>;
  faqs: FaqItem[];
}

const CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Set up your workspace in minutes',
    icon: FiBookOpen,
    faqs: [
      {
        question: 'How do I create a workspace?',
        answer: 'Press the Create workspace button on the dashboard.',
      },
      {
        question: 'How do I invite teammates?',
        answer: 'Open Team members and send an invite.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Plans, invoices and payment methods',
    icon: FiCreditCard,
    faqs: [
      {
        question: 'How do I change my plan?',
        answer: 'Visit Billing and pick a new tier.',
      },
      {
        question: 'Where do I find invoices?',
        answer: 'Download them from the invoice table on Billing.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Profile, security and notifications',
    icon: FiUsers,
    faqs: [
      {
        question: 'How do I reset my password?',
        answer: 'Use the Change password section in Profile.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fix common issues fast',
    icon: FiSliders,
    faqs: [
      {
        question: 'Why is my integration failing?',
        answer: 'Disconnect and reconnect it from Integrations.',
      },
    ],
  },
];

const filterCategories = (
  categories: HelpCategory[],
  query: string
): HelpCategory[] =>
  categories.filter(
    (category) =>
      category.title.toLowerCase().includes(query.trim().toLowerCase()) ||
      category.description.toLowerCase().includes(query.trim().toLowerCase())
  );

export const HelpCenterTemplate: FC = () => {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = filterCategories(CATEGORIES, query);
  const active =
    CATEGORIES.find((category) => category.id === activeId) ?? null;
  const ActiveIcon = active?.icon ?? FiHelpCircle;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Help center</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find answers and reach our support team.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="relative mb-6 max-w-md">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help topics..."
            className="input input-bordered w-full pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No categories found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    setActiveId(activeId === category.id ? null : category.id)
                  }
                  className={`card border text-left transition-colors ${
                    activeId === category.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-base-200 border-base-content/10 hover:border-primary/40'
                  }`}>
                  <div className="card-body p-5">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="font-semibold">{category.title}</h3>
                    </div>
                    <p className="text-base-content/50 text-sm">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {active && (
          <div className="card bg-base-200 border-base-content/10 mt-6 border">
            <div className="card-body p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{active.title}</h3>
                  <p className="text-base-content/50 text-xs">
                    {active.description}
                  </p>
                </div>
              </div>
              {active.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="border-base-content/10 border-b py-2">
                  <summary className="flex cursor-pointer items-center justify-between py-1">
                    <span className="text-sm font-medium">{faq.question}</span>
                  </summary>
                  <p className="text-base-content/60 pb-2 text-sm">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        <div className="border-base-content/10 bg-base-200 mt-6 flex flex-col items-center gap-2 rounded-2xl border px-6 py-8 text-center">
          <FiHelpCircle className="text-base-content/40 h-6 w-6" />
          <h3 className="font-semibold">Need more help?</h3>
          <p className="text-base-content/50 text-sm">
            Our support team is ready to assist you.
          </p>
          <a
            href="mailto:support@acme.com"
            className="btn btn-primary btn-sm mt-1">
            Contact support
          </a>
        </div>
      </main>
    </div>
  );
};

HelpCenterTemplate.displayName = 'HelpCenterTemplate';
