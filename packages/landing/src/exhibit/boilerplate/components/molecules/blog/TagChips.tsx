import type { FC } from 'react';

interface TagChipsProps {
  tags: string[];
  title?: string;
}

export const TagChips: FC<TagChipsProps> = ({ tags, title = 'Tags' }) => (
  <div data-testid="tag-chips" className="flex flex-col gap-2">
    <h4 className="text-sm font-medium">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <a
          key={tag}
          href={`/tags/${tag}`}
          className="badge badge-outline badge-lg">
          {tag}
        </a>
      ))}
    </div>
  </div>
);

TagChips.displayName = 'TagChips';
