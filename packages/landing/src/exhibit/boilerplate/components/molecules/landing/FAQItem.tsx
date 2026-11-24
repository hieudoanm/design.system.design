'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export const FAQItem: FC<FAQItemProps> = ({
  question,
  answer,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      data-testid="faq-item"
      className="collapse-arrow bg-base-200 border-base-content/10 collapse border">
      <input
        type="checkbox"
        className="peer"
        checked={open}
        onChange={() => setOpen((prev) => !prev)}
        aria-label={question}
      />
      <div className="collapse-title text-sm font-medium">{question}</div>
      <div className="collapse-content">
        <p className="text-base-content/70 text-sm">{answer}</p>
      </div>
    </div>
  );
};
