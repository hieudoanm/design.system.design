'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    id: 'f1',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click Forgot password.',
  },
  {
    id: 'f2',
    question: 'What is your refund policy?',
    answer: 'Refunds are issued within 5-7 business days.',
  },
  {
    id: 'f3',
    question: 'How do I upgrade my plan?',
    answer: 'Open Billing in your settings and choose a new plan.',
  },
  {
    id: 'f4',
    question: 'Do you offer monthly billing?',
    answer: 'Yes, monthly billing is available on every plan.',
  },
  {
    id: 'f5',
    question: 'How do I contact support?',
    answer: 'Email us at support@example.com or use the live chat.',
  },
];

export const FaqTemplate: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">FAQs</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Common questions, answered.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">{FAQS.length} FAQs</p>

        <div className="flex flex-col gap-4">
          {FAQS.map((faq) => {
            const expanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{faq.question}</p>
                    <button
                      onClick={() => toggle(faq.id)}
                      className="btn btn-ghost btn-xs gap-1">
                      {expanded ? <FiChevronUp /> : <FiChevronDown />}
                      {expanded ? 'Hide answer' : 'Show answer'}
                    </button>
                  </div>
                  {expanded && (
                    <p className="text-base-content/70 mt-3 text-sm">
                      {faq.answer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

FaqTemplate.displayName = 'FaqTemplate';
