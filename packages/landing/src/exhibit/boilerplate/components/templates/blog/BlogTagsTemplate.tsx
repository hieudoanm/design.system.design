'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiHash, FiX } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

interface BlogTag {
  name: string;
  count: number;
}

interface TaggedPost {
  title: string;
  tags: string[];
}

const TAGS: BlogTag[] = [
  { name: 'nextjs', count: 9 },
  { name: 'rust', count: 7 },
  { name: 'ai', count: 6 },
  { name: 'design', count: 4 },
  { name: 'testing', count: 5 },
  { name: 'performance', count: 3 },
];

const POSTS: TaggedPost[] = [
  { title: 'App router tips', tags: ['nextjs', 'performance'] },
  { title: 'Rust at the edge', tags: ['rust', 'performance'] },
  { title: 'Prompt patterns', tags: ['ai'] },
  { title: 'Design tokens', tags: ['design'] },
  { title: 'Jest at scale', tags: ['testing'] },
  { title: 'Server actions', tags: ['nextjs'] },
];

export const BlogTagsTemplate: FC = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? POSTS.filter((post) => post.tags.includes(activeTag))
    : POSTS;

  return (
    <PageShell
      title="Tags"
      subtitle="Browse posts by topic"
      backHref="/blog"
      maxWidth="max-w-2xl"
      gap="gap-6">
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const active = activeTag === tag.name;
          return (
            <button
              key={tag.name}
              onClick={() => setActiveTag(active ? null : tag.name)}
              className={`badge badge-lg gap-1 ${
                active ? 'badge-primary' : 'badge-outline'
              }`}>
              <FiHash className="h-3 w-3" />
              {tag.name} ({tag.count})
            </button>
          );
        })}
      </div>

      {activeTag && (
        <div className="flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {filtered.length} posts tagged {activeTag}
          </p>
          <button
            onClick={() => setActiveTag(null)}
            className="btn btn-ghost btn-xs gap-1">
            <FiX className="h-3 w-3" />
            Clear filter
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {filtered.map((post) => (
          <li
            key={post.title}
            className="border-base-content/10 bg-base-200 rounded-xl border px-4 py-3 text-sm">
            {post.title}
          </li>
        ))}
      </ul>
    </PageShell>
  );
};

BlogTagsTemplate.displayName = 'BlogTagsTemplate';
