'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Tag } from '../../atoms/blog/Tag';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const clean = (value: string): string => value.trim();

export const TagInput: FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Type and press Enter',
  disabled = false,
}) => {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = clean(draft);
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            variant="primary"
            onRemove={() => removeTag(tag)}
          />
        ))}
      </div>
      <input
        aria-label="Add tag"
        className="input input-bordered w-full"
        value={draft}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
          }
          if (e.key === 'Backspace' && clean(draft) === '' && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
          }
        }}
      />
    </div>
  );
};
