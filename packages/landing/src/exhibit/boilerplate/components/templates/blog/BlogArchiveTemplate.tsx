'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

interface ArchivePost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  readingTime: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const mockPosts: ArchivePost[] = [
  {
    slug: 'building-a-design-system',
    title: 'Building a Design System',
    date: '2024-01-12',
    tags: ['Design', 'React'],
    readingTime: 8,
  },
  {
    slug: 'testing-strategies',
    title: 'Testing Strategies for React Apps',
    date: '2024-01-18',
    tags: ['Testing', 'React'],
    readingTime: 6,
  },
  {
    slug: 'css-in-js',
    title: 'CSS-in-JS Trade-offs',
    date: '2024-01-25',
    tags: ['Styling'],
    readingTime: 5,
  },
  {
    slug: 'server-components',
    title: 'A Deep Dive into Server Components',
    date: '2024-03-08',
    tags: ['React', 'Next.js'],
    readingTime: 11,
  },
  {
    slug: 'bun-vs-node',
    title: 'Bun vs Node: A Practical Comparison',
    date: '2024-03-21',
    tags: ['Performance'],
    readingTime: 7,
  },
  {
    slug: 'rust-cli-tools',
    title: 'Writing CLI Tools in Rust',
    date: '2023-11-02',
    tags: ['Rust'],
    readingTime: 9,
  },
  {
    slug: 'golang-apis',
    title: 'Designing Go APIs',
    date: '2023-11-15',
    tags: ['Go'],
    readingTime: 10,
  },
  {
    slug: 'graphql-vs-rest',
    title: 'GraphQL vs REST in 2023',
    date: '2023-06-10',
    tags: ['API'],
    readingTime: 6,
  },
];

const getMonthLabel = (date: string): string => {
  const [year, month] = date.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
};

const PostMeta = ({
  date,
  readingTime,
}: Pick<ArchivePost, 'date' | 'readingTime'>) => (
  <div className="text-base-content/50 flex flex-wrap items-center gap-3 text-sm">
    <span className="flex items-center gap-1.5">
      <FiCalendar className="h-3.5 w-3.5" />
      {date}
    </span>
    <span className="flex items-center gap-1.5">
      <FiClock className="h-3.5 w-3.5" />
      {readingTime} min read
    </span>
  </div>
);

export const BlogArchiveTemplate: FC = () => {
  const [year, setYear] = useState('all');
  const [month, setMonth] = useState('all');

  const filtered = mockPosts.filter((post) => {
    const matchesYear = year === 'all' || post.date.startsWith(year);
    const matchesMonth = month === 'all' || getMonthLabel(post.date) === month;
    return matchesYear && matchesMonth;
  });

  const yearPosts =
    year === 'all'
      ? mockPosts
      : mockPosts.filter((post) => post.date.startsWith(year));

  const monthCounts = [
    ...new Set(yearPosts.map((post) => getMonthLabel(post.date))),
  ].map((label) => ({
    label,
    count: yearPosts.filter((post) => getMonthLabel(post.date) === label)
      .length,
  }));

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <PageShell
      title="Blog Archive"
      subtitle="Browse every post"
      backHref="/blog"
      maxWidth="max-w-5xl"
      gap="gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="join">
          <span className="btn btn-ghost join-item pointer-events-none">
            Year
          </span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Filter by year"
            className="select select-bordered select-sm join-item">
            <option value="all">All years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <p className="text-base-content/50 text-sm">
          {filtered.length} post{filtered.length === 1 ? '' : 's'} found
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {filtered.length > 0 ? (
            <>
              <article className="border-base-content/10 bg-base-200 hover:border-primary/50 flex flex-col gap-3 rounded-2xl border p-6 transition-colors">
                <div className="flex flex-wrap gap-1.5">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="badge badge-ghost badge-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl">{featured.title}</h2>
                <PostMeta
                  date={featured.date}
                  readingTime={featured.readingTime}
                />
              </article>

              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {rest.map((post) => (
                    <article
                      key={post.slug}
                      className="border-base-content/10 bg-base-200 hover:border-primary/50 flex flex-col gap-2 rounded-xl border p-5 transition-colors">
                      <h3 className="text-base font-medium">{post.title}</h3>
                      <PostMeta
                        date={post.date}
                        readingTime={post.readingTime}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="badge badge-ghost badge-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
              <FiTag className="text-base-content/20 h-8 w-8" />
              <p className="text-base-content/50 text-sm">No posts found</p>
            </div>
          )}
        </div>

        <aside className="border-base-content/10 bg-base-200 h-fit rounded-2xl border p-6">
          <h3 className="mb-4 text-base">Archives by month</h3>
          <ul className="flex flex-col gap-1">
            {monthCounts.map(({ label, count }) => (
              <li key={label}>
                <button
                  onClick={() => setMonth(month === label ? 'all' : label)}
                  className={`w-full text-left text-sm transition-colors ${
                    month === label
                      ? 'text-primary'
                      : 'text-base-content/60 hover:text-base-content'
                  }`}>
                  {label} ({count})
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PageShell>
  );
};

BlogArchiveTemplate.displayName = 'BlogArchiveTemplate';
