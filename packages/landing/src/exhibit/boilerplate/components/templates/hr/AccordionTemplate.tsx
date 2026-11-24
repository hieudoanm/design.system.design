'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface AccordionItem {
  id: number;
  question: string;
  answer: string;
}

const ITEMS: AccordionItem[] = [
  {
    id: 1,
    question: 'What is this boilerplate?',
    answer:
      'A Next.js + DaisyUI + Tailwind starter with prebuilt template components.',
  },
  {
    id: 2,
    question: 'How do I add a new route?',
    answer:
      'Create a page.tsx under src/app/(main)/(app)/<route> that renders a shared template.',
  },
  {
    id: 3,
    question: 'Can I use these templates in the desktop app?',
    answer:
      'Yes — every template is a plain React component that also runs in the Tauri webview.',
  },
  {
    id: 4,
    question: 'How are tests organized?',
    answer:
      'Tests live in src/components/templates/shared/__tests__ and use @testing-library/react.',
  },
];

export const AccordionTemplate: FC = () => {
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isOpen = (id: number) => openIds.includes(id);

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Accordions
          </p>
          <h1>Accordion showcase</h1>
          <p className="text-base-content/50 text-sm">
            DaisyUI details accordions with controlled state.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {openIds.length} of {ITEMS.length} open
          </p>
          <button
            type="button"
            onClick={() => toggleItem(2)}
            className="btn btn-primary btn-sm">
            Toggle question 2
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {ITEMS.map((item) => (
            <details
              key={item.id}
              open={isOpen(item.id)}
              onClick={(e) => {
                e.preventDefault();
                toggleItem(item.id);
              }}
              className="border-base-content/10 bg-base-200 rounded-2xl border">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4">
                <span className="font-medium">{item.question}</span>
                <span className="flex items-center gap-3">
                  <span
                    className={`badge badge-sm ${
                      isOpen(item.id) ? 'badge-primary' : 'badge-ghost'
                    }`}>
                    {isOpen(item.id) ? 'Open' : 'Closed'}
                  </span>
                  {isOpen(item.id) ? (
                    <FiChevronUp className="text-base-content/40 h-4 w-4" />
                  ) : (
                    <FiChevronDown className="text-base-content/40 h-4 w-4" />
                  )}
                </span>
              </summary>
              <div className="text-base-content/70 border-base-content/10 border-t px-5 py-4 text-sm">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
};

AccordionTemplate.displayName = 'AccordionTemplate';
