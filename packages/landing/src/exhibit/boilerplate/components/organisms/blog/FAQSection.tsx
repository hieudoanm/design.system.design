import type { FC } from 'react';
import { Accordion } from '../../molecules/support/Accordion';

interface FaqItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FaqItem[];
  title?: string;
}

export const FAQSection: FC<FAQSectionProps> = ({ items, title = 'FAQ' }) => (
  <section className="flex flex-col items-center gap-6 py-10">
    <h2 className="text-2xl">{title}</h2>
    <div className="w-full max-w-3xl">
      <Accordion
        multiple
        items={items.map((item) => ({
          id: item.question,
          title: item.question,
          content: item.answer,
        }))}
      />
    </div>
  </section>
);
