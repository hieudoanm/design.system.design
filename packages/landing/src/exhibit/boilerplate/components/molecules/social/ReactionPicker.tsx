'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface ReactionOption {
  emoji: string;
  label: string;
}

interface ReactionPickerProps {
  options?: ReactionOption[];
  onSelect?: (reaction: string) => void;
}

const DEFAULT_OPTIONS: ReactionOption[] = [
  { emoji: '\uD83D\uDC4D', label: 'Like' },
  { emoji: '\uD83E\uDD1F', label: 'Love' },
  { emoji: '\uD83D\uDE42', label: 'Haha' },
  { emoji: '\uD83D\uDE2E', label: 'Wow' },
  { emoji: '\uD83D\uDE22', label: 'Sad' },
  { emoji: '\uD83D\uDE21', label: 'Angry' },
];

export const ReactionPicker: FC<ReactionPickerProps> = ({
  options = DEFAULT_OPTIONS,
  onSelect,
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div
      role="group"
      aria-label="Reactions"
      className="border-base-300 bg-base-200 flex flex-wrap items-center gap-1 rounded-full border p-2"
      data-testid="reaction-picker">
      {options.map((option) => {
        const isSelected = option.label === selected;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={isSelected}
            aria-label={option.label}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-lg transition-colors ${
              isSelected ? 'bg-primary/20' : 'hover:bg-base-300'
            }`}
            onClick={() => {
              setSelected(option.label);
              onSelect?.(option.label);
            }}>
            <span aria-hidden>{option.emoji}</span>
            <span className="text-xs">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
