'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiSearch,
  FiX,
  FiArrowRight,
  FiClock,
  FiHome,
  FiSettings,
  FiInfo,
} from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: <FiHome /> },
  { label: 'About', href: '/shared/about', icon: <FiInfo /> },
  { label: 'Settings', href: '/app/settings', icon: <FiSettings /> },
  { label: 'Version', href: '/app/version', icon: <FiClock /> },
];

const mockResults = [
  {
    title: 'Getting Started Guide',
    href: '/blog/getting-started',
    category: 'Blog',
    snippet:
      'A comprehensive guide to building modern web applications with the latest tools and frameworks.',
  },
  {
    title: 'Profile Settings',
    href: '/app/settings',
    category: 'App',
    snippet: 'Manage your account settings, notifications, and preferences.',
  },
  {
    title: 'Pricing Plans',
    href: '/landing/pricing',
    category: 'Marketing',
    snippet: 'Simple, transparent pricing for teams of all sizes.',
  },
  {
    title: 'Sign In',
    href: '/auth/sign-in',
    category: 'Auth',
    snippet: 'Sign in to your account to access your dashboard.',
  },
  {
    title: 'Store',
    href: '/store',
    category: 'Store',
    snippet: 'Browse our curated collection of workspace essentials.',
  },
];

export const SearchTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const results = query
    ? mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <PageShell title="Search" backHref="/" navItems={NAV_ITEMS}>
      <div className="relative">
        <FiSearch className="text-base-content/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search pages, settings, and more..."
          className="input input-bordered w-full py-3 pr-10 pl-12 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2">
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {query && (
        <div className="flex flex-col gap-3">
          {results.length > 0 ? (
            results.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="border-base-content/10 bg-base-200 hover:border-primary/50 flex items-start gap-4 rounded-xl border p-4 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{r.title}</p>
                    <span className="badge badge-ghost badge-xs">
                      {r.category}
                    </span>
                  </div>
                  <p className="text-base-content/50 mt-1 text-xs leading-relaxed">
                    {r.snippet}
                  </p>
                </div>
                <FiArrowRight className="text-base-content/30 mt-1 h-4 w-4 shrink-0" />
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FiSearch className="text-base-content/20 h-10 w-10" />
              <p className="text-base-content/50 text-sm">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="flex flex-col gap-4">
          <p className="text-base-content/40 text-xs tracking-[0.2em] uppercase">
            Recent searches
          </p>
          {['Settings', 'Pricing', 'Blog'].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <FiClock className="text-base-content/30 h-3.5 w-3.5" />
              <span className="text-base-content/50">{item}</span>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

SearchTemplate.displayName = 'SearchTemplate';
