'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiThumbsUp } from 'react-icons/fi';

type ColumnCategory = 'Politics' | 'Culture' | 'Tech';
type CategoryFilter = 'All' | ColumnCategory;

interface OpinionColumn {
  id: string;
  title: string;
  author: string;
  role: string;
  date: string;
  category: ColumnCategory;
  reactions: number;
}

const COLUMNS: OpinionColumn[] = [
  {
    id: 'o1',
    title: 'Why We Need Stronger Election Reforms',
    author: 'Elena Vasquez',
    role: 'Politics Columnist',
    date: 'Aug 1, 2026',
    category: 'Politics',
    reactions: 24,
  },
  {
    id: 'o2',
    title: 'The Concert Economy Is Back',
    author: 'Noah Kim',
    role: 'Culture Columnist',
    date: 'Jul 30, 2026',
    category: 'Culture',
    reactions: 12,
  },
  {
    id: 'o3',
    title: 'Algorithms Deserve a Human Backstop',
    author: 'Grace Adeyemi',
    role: 'Tech Columnist',
    date: 'Jul 29, 2026',
    category: 'Tech',
    reactions: 35,
  },
  {
    id: 'o4',
    title: 'Suburbs Are the Next Climate Battlefield',
    author: 'Daniel Roy',
    role: 'Politics Columnist',
    date: 'Jul 28, 2026',
    category: 'Politics',
    reactions: 18,
  },
  {
    id: 'o5',
    title: 'Public Libraries Are Quiet Superheroes',
    author: 'Aisha Noor',
    role: 'Culture Columnist',
    date: 'Jul 27, 2026',
    category: 'Culture',
    reactions: 41,
  },
  {
    id: 'o6',
    title: "Don't Fear the Chip Shortage",
    author: 'Marco Silva',
    role: 'Tech Columnist',
    date: 'Jul 26, 2026',
    category: 'Tech',
    reactions: 9,
  },
];

const FILTERS: CategoryFilter[] = ['All', 'Politics', 'Culture', 'Tech'];

export const OpinionTemplate: FC = () => {
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [reactions, setReactions] = useState<Record<string, number>>({});

  const visible = COLUMNS.filter(
    (column) => filter === 'All' || column.category === filter
  );

  const getReactions = (column: OpinionColumn) =>
    column.reactions + (reactions[column.id] ?? 0);

  const react = (id: string) =>
    setReactions((current) => ({
      ...current,
      [id]: (current[id] ?? 0) + 1,
    }));

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Opinion</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Columns and commentary.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
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
            {visible.length} columns
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {visible.map((column) => (
            <article
              key={column.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="badge badge-ghost badge-sm">
                    {column.category}
                  </span>
                  <button
                    onClick={() => react(column.id)}
                    className="btn btn-ghost btn-xs gap-1">
                    <FiThumbsUp className="h-3.5 w-3.5" />
                    {getReactions(column)} reactions
                  </button>
                </div>
                <h2 className="text-base font-semibold">{column.title}</h2>
                <p className="text-base-content/50 text-sm">
                  <span>{column.author}</span>
                  <span> · {column.role}</span>
                </p>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiCalendar className="h-3 w-3" />
                  {column.date}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

OpinionTemplate.displayName = 'OpinionTemplate';
