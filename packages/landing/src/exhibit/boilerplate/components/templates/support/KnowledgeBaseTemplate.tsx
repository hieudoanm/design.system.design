'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiSearch } from 'react-icons/fi';

type ArticleCategory = 'Getting Started' | 'Billing' | 'Account';
type CategoryFilter = 'All' | ArticleCategory;

interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  readTime: number;
}

const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'Getting started with your account',
    category: 'Getting Started',
    readTime: 4,
  },
  {
    id: 'a2',
    title: 'Set up two-factor authentication',
    category: 'Getting Started',
    readTime: 6,
  },
  {
    id: 'a3',
    title: 'Understanding your invoice',
    category: 'Billing',
    readTime: 5,
  },
  {
    id: 'a4',
    title: 'How refunds work',
    category: 'Billing',
    readTime: 3,
  },
  {
    id: 'a5',
    title: 'Update your profile',
    category: 'Account',
    readTime: 2,
  },
  {
    id: 'a6',
    title: 'Manage notification preferences',
    category: 'Account',
    readTime: 7,
  },
];

const FILTERS: CategoryFilter[] = [
  'All',
  'Getting Started',
  'Billing',
  'Account',
];

export const KnowledgeBaseTemplate: FC = () => {
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [query, setQuery] = useState('');

  const visible = ARTICLES.filter((article) => {
    const matchesCategory = filter === 'All' || article.category === filter;
    const matchesQuery = article.title
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find answers in our help articles.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {visible.length} articles
          </p>
        </div>

        <div className="relative mb-6">
          <FiSearch className="text-base-content/40 absolute top-2.5 left-3" />
          <input
            aria-label="Search articles"
            placeholder="Search articles..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input input-bordered input-sm w-full pl-9"
          />
        </div>

        {visible.length === 0 ? (
          <p className="text-base-content/50 text-sm">No articles found</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((article) => (
              <div
                key={article.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex flex-col items-start gap-2 p-5">
                  <span className="badge badge-ghost badge-sm">
                    {article.category}
                  </span>
                  <h2 className="text-sm font-semibold">{article.title}</h2>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiClock />
                    {article.readTime} min read
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

KnowledgeBaseTemplate.displayName = 'KnowledgeBaseTemplate';
