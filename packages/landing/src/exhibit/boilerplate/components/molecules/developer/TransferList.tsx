'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';

interface TransferItem {
  id: string;
  label: string;
}

interface TransferListProps {
  left: TransferItem[];
  right: TransferItem[];
  onChange: (left: TransferItem[], right: TransferItem[]) => void;
  leftTitle?: string;
  rightTitle?: string;
}

export const TransferList: FC<TransferListProps> = ({
  left,
  right,
  onChange,
  leftTitle = 'Available',
  rightTitle = 'Selected',
}) => {
  const [selectedLeft, setSelectedLeft] = useState<Set<string>>(new Set());
  const [selectedRight, setSelectedRight] = useState<Set<string>>(new Set());

  const toggle = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    id: string
  ) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const move = (from: TransferItem[], set: Set<string>, toRight: boolean) => {
    const moved = from.filter((item) => set.has(item.id));
    if (moved.length === 0) return;
    if (toRight) {
      onChange(
        left.filter((item) => !set.has(item.id)),
        [...right, ...moved]
      );
    } else {
      onChange(
        [...left, ...moved],
        right.filter((item) => !set.has(item.id))
      );
    }
    setSelectedLeft(new Set());
    setSelectedRight(new Set());
  };

  const moveAll = (toRight: boolean) => {
    if (toRight) {
      onChange([], [...right, ...left]);
    } else {
      onChange([...left, ...right], []);
    }
    setSelectedLeft(new Set());
    setSelectedRight(new Set());
  };

  return (
    <div className="flex flex-wrap items-start gap-4">
      <ListColumn
        title={leftTitle}
        items={left}
        selected={selectedLeft}
        onToggle={(id) => toggle(setSelectedLeft, id)}
      />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => move(left, selectedLeft, true)}
          disabled={selectedLeft.size === 0}>
          →
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => move(right, selectedRight, false)}
          disabled={selectedRight.size === 0}>
          ←
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => moveAll(true)}>
          »
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => moveAll(false)}>
          «
        </button>
      </div>
      <ListColumn
        title={rightTitle}
        items={right}
        selected={selectedRight}
        onToggle={(id) => toggle(setSelectedRight, id)}
      />
    </div>
  );
};

interface ListColumnProps {
  title: string;
  items: TransferItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}

const ListColumn: FC<ListColumnProps> = ({
  title,
  items,
  selected,
  onToggle,
}) => (
  <fieldset className="border-base-content/10 w-48 rounded-xl border p-2">
    <legend className="px-2">{title}</legend>
    <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
      {items.length === 0 && (
        <p className="text-base-content/40 px-2 py-1 text-sm">No items</p>
      )}
      {items.map((item) => (
        <label
          key={item.id}
          className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={selected.has(item.id)}
            onChange={() => onToggle(item.id)}
          />
          {item.label}
        </label>
      ))}
    </div>
  </fieldset>
);

TransferList.displayName = 'TransferList';
