'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFolder, FiSearch } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

interface BlogCategory {
  id: string;
  name: string;
  count: number;
  description: string;
  posts: string[];
}

const CATEGORIES: BlogCategory[] = [
  {
    id: 'engineering',
    name: 'Engineering',
    count: 12,
    description: 'Deep dives on architecture, tooling, and code.',
    posts: [
      'Scaling the payments pipeline',
      'Monorepo tooling in 2026',
      'Rust at the edge',
    ],
  },
  {
    id: 'product',
    name: 'Product',
    count: 8,
    description: 'Product thinking, roadmaps, and launches.',
    posts: ['Shipping a smaller MVP', 'The roadmap debate'],
  },
  {
    id: 'design',
    name: 'Design',
    count: 6,
    description: 'Interface and design-system notes.',
    posts: ['Tokens that scale', 'Dark mode without tears'],
  },
  {
    id: 'company',
    name: 'Company',
    count: 5,
    description: 'Announcements and culture.',
    posts: ['Welcome to the team', 'Our 2026 roadmap'],
  },
];

export const BlogCategoriesTemplate: FC = () => {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = CATEGORIES.filter((category) =>
    category.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <PageShell
      title="Categories"
      subtitle={`${filtered.length} categories`}
      backHref="/blog"
      maxWidth="max-w-2xl"
      gap="gap-6">
      <div className="relative">
        <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories..."
          aria-label="Search categories"
          className="input input-bordered w-full pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-base-content/50 text-sm">No categories found</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((category) => {
            const isOpen = expandedId === category.id;
            return (
              <div
                key={category.id}
                className="border-base-content/10 bg-base-200 rounded-2xl border">
                <button
                  onClick={() => toggle(category.id)}
                  className="flex w-full items-center gap-3 p-5 text-left">
                  <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <FiFolder className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {category.name}
                    </span>
                    <span className="text-base-content/50 block text-xs">
                      {category.count} posts · {category.description}
                    </span>
                  </span>
                  {isOpen ? (
                    <FiChevronUp className="text-base-content/40 h-4 w-4" />
                  ) : (
                    <FiChevronDown className="text-base-content/40 h-4 w-4" />
                  )}
                </button>
                {isOpen && (
                  <ul className="border-base-content/10 border-t px-5 py-3">
                    {category.posts.map((post) => (
                      <li
                        key={post}
                        className="text-base-content/70 py-1 text-sm">
                        {post}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

BlogCategoriesTemplate.displayName = 'BlogCategoriesTemplate';
