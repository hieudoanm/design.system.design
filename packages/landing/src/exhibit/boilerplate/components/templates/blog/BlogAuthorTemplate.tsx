'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiCheck,
  FiTwitter,
  FiGithub,
  FiLinkedin,
} from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

interface AuthorPost {
  slug: string;
  title: string;
  date: string;
  readingTime: number;
}

const authorPosts: AuthorPost[] = [
  {
    slug: 'building-a-design-system',
    title: 'Building a Design System',
    date: '2024-01-12',
    readingTime: 8,
  },
  {
    slug: 'testing-strategies',
    title: 'Testing Strategies for React Apps',
    date: '2024-01-18',
    readingTime: 6,
  },
  {
    slug: 'server-components',
    title: 'A Deep Dive into Server Components',
    date: '2024-03-08',
    readingTime: 11,
  },
];

const socials = [
  {
    label: 'Twitter',
    href: 'https://twitter.com/janedoe',
    icon: <FiTwitter className="h-4 w-4" />,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/janedoe',
    icon: <FiGithub className="h-4 w-4" />,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/janedoe',
    icon: <FiLinkedin className="h-4 w-4" />,
  },
];

export const BlogAuthorTemplate: FC = () => {
  const [following, setFollowing] = useState(false);

  const toggleFollow = () => setFollowing((prev) => !prev);

  return (
    <PageShell
      title="Author Profile"
      subtitle="Meet the writers"
      backHref="/blog"
      maxWidth="max-w-3xl"
      gap="gap-8">
      <section className="border-base-content/10 bg-base-200 flex flex-col items-center gap-5 rounded-2xl border p-8 sm:flex-row sm:items-start">
        <div className="bg-primary text-primary-content flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-semibold">
          JD
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl">Jane Doe</h2>
            {following ? (
              <span className="badge badge-success gap-1">
                <FiCheck className="h-3 w-3" />
                Following
              </span>
            ) : (
              <span className="badge badge-ghost">Author</span>
            )}
          </div>
          <p className="text-base-content/50 text-sm">Staff Engineer</p>
          <p className="text-base-content/70 max-w-md text-sm leading-relaxed">
            Jane writes about design systems, testing, and everything React.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="btn btn-ghost btn-circle btn-sm">
                {social.icon}
              </a>
            ))}
          </div>
          <button
            onClick={toggleFollow}
            className={`btn btn-sm gap-1.5 ${
              following ? 'btn-outline' : 'btn-primary'
            }`}>
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg">Posts by Jane Doe</h2>
        <ul className="flex flex-col gap-3">
          {authorPosts.map((post) => (
            <li key={post.slug}>
              <a
                href={`/blog/${post.slug}`}
                className="border-base-content/10 bg-base-200 hover:border-primary/50 flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{post.title}</p>
                  <div className="text-base-content/40 flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="h-3 w-3" />
                      {post.readingTime} min read
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm">
                  Read post
                  <FiArrowRight className="h-4 w-4" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
};

BlogAuthorTemplate.displayName = 'BlogAuthorTemplate';
