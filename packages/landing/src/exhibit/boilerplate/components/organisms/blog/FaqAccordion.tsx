'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import type { FC } from 'react';

interface FaqAccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqAccordionItem[];
  title?: string;
  description?: string;
}

export const FaqAccordion: FC<FaqAccordionProps> = ({
  items,
  title,
  description,
}) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const toggle = (id: string): void => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="flex w-full flex-col gap-4">
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="text-xl font-medium">{title}</h2>}
          {description && (
            <p className="text-base-content/60 text-sm">{description}</p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          const open = openId === item.id;
          return (
            <div
              key={item.id}
              className={`border-base-content/10 bg-base-200 rounded-xl border ${
                open ? 'border-primary' : ''
              }`}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
                <span className="flex items-center gap-3">
                  <span className="text-base-content/50 font-mono text-xs">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium">{item.question}</span>
                </span>
                <FiChevronDown
                  aria-hidden="true"
                  className={`shrink-0 transition-transform ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open && (
                <p className="text-base-content/60 border-base-content/10 border-t px-4 py-3 text-sm">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
