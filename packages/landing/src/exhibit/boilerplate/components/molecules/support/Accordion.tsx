'use client';

import type { FC, ReactNode } from 'react';
import { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
}

export const Accordion: FC<AccordionProps> = ({ items, multiple = false }) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenIds((current) =>
      multiple
        ? current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id]
        : current.includes(id)
          ? []
          : [id]
    );
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {items.map((item) => {
        const open = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`collapse-arrow border-base-content/10 bg-base-200 collapse border ${
              open ? 'collapse-open' : ''
            }`}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={open}
              className="collapse-title text-sm font-medium">
              {item.title}
            </button>
            {open && (
              <div className="collapse-content text-sm">
                <p>{item.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
