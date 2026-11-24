'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  category?: string;
  checked?: boolean;
}

interface ChecklistSectionProps {
  items: ChecklistItem[];
  title?: string;
}

export const ChecklistSection: FC<ChecklistSectionProps> = ({
  items,
  title = 'Packing checklist',
}) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.checked ?? false]))
  );

  const toggle = (id: string): void => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const done = items.filter((item) => checked[item.id]).length;
  const progress =
    items.length === 0 ? 0 : Math.round((done / items.length) * 100);

  return (
    <section data-testid="checklist-section" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="badge badge-ghost">
          {done}/{items.length}
        </span>
      </div>
      <progress
        className="progress progress-primary w-full"
        value={done}
        max={items.length}
      />
      <ul className="flex flex-col gap-2">
        {items.length === 0 && (
          <li className="text-base-content/60 text-sm">Checklist is empty</li>
        )}
        {items.map((item) => (
          <li key={item.id}>
            <label className="card card-side bg-base-200 items-center p-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mr-3"
                checked={checked[item.id]}
                aria-label={`Check ${item.label}`}
                onChange={() => toggle(item.id)}
              />
              <div>
                <span
                  className={`text-sm ${checked[item.id] ? 'line-through opacity-60' : ''}`}>
                  {item.label}
                </span>
                {item.category && (
                  <span className="badge badge-ghost badge-sm ml-2">
                    {item.category}
                  </span>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
};
