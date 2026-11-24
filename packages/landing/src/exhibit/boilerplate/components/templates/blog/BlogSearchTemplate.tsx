'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiFileText, FiSearch } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

interface BlogPostSummary {
  title: string;
  excerpt: string;
}

const POSTS: BlogPostSummary[] = [
  {
    title: 'App router tips',
    excerpt: 'Practical patterns for the Next.js app router.',
  },
  {
    title: 'Rust at the edge',
    excerpt: 'Running WebAssembly workloads in front of your origin.',
  },
  {
    title: 'Prompt patterns',
    excerpt: 'A field guide to structuring LLM prompts.',
  },
  {
    title: 'Design tokens',
    excerpt: 'Scaling a design system with semantic tokens.',
  },
  {
    title: 'Jest at scale',
    excerpt: 'Keeping test suites fast and meaningful.',
  },
];

export const BlogSearchTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? POSTS.filter(
        (post) =>
          post.title.toLowerCase().includes(normalized) ||
          post.excerpt.toLowerCase().includes(normalized)
      )
    : POSTS;

  return (
    <PageShell
      title="Search"
      subtitle="Find posts across the blog"
      backHref="/blog"
      maxWidth="max-w-2xl"
      gap="gap-6">
      <div className="relative">
        <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          aria-label="Search posts"
          className="input input-bordered w-full pl-9"
        />
      </div>

      {normalized ? (
        <p className="text-base-content/50 text-sm">
          {results.length} results for &quot;{query.trim()}&quot;
        </p>
      ) : (
        <p className="text-base-content/50 text-sm">All posts</p>
      )}

      {results.length === 0 ? (
        <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-3 rounded-2xl border p-10 text-center">
          <FiFileText className="text-base-content/20 h-10 w-10" />
          <p className="text-base-content/50 text-sm">No results found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((post) => (
            <div
              key={post.title}
              className="border-base-content/10 bg-base-200 rounded-xl border p-5">
              <p className="text-sm font-medium">{post.title}</p>
              <p className="text-base-content/50 mt-1 text-sm">
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

BlogSearchTemplate.displayName = 'BlogSearchTemplate';
