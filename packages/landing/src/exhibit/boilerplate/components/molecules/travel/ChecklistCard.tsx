'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistCardProps {
  items: ChecklistItem[];
  title?: string;
  defaultChecked?: string[];
}

export const ChecklistCard: FC<ChecklistCardProps> = ({
  items,
  title = 'Packing checklist',
  defaultChecked = [],
}) => {
  const [checked, setChecked] = useState<string[]>(defaultChecked);

  const toggle = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="checklist-card">
      <div className="card-body gap-2">
        <h3 className="card-title text-base">{title}</h3>
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={checked.includes(item.id)}
                  onChange={() => toggle(item.id)}
                />
                <span
                  className={
                    checked.includes(item.id)
                      ? 'text-base-content/50 line-through'
                      : ''
                  }>
                  {item.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
