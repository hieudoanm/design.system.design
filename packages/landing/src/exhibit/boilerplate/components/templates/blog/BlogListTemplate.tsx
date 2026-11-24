'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiCalendar, FiArrowRight, FiTag, FiX } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';
import type { BlogPostData } from './BlogItemTemplate';

interface BlogsTemplateProps {
  posts: BlogPostData[];
}

export const BlogListTemplate: FC<BlogsTemplateProps> = ({ posts }) => {
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <PageShell
      title="Blog"
      subtitle="Stories and insights"
      backHref="/"
      maxWidth="max-w-4xl"
      gap="gap-8">
      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`btn btn-sm gap-1.5 ${
                activeTag === tag ? 'btn-primary' : 'btn-ghost'
              }`}>
              <FiTag className="h-3.5 w-3.5" />
              {tag}
            </button>
          ))}
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="btn btn-ghost btn-sm gap-1.5 text-xs">
              <FiX className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Post grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="border-base-content/10 bg-base-200 hover:border-primary/50 group flex flex-col rounded-xl border p-6 transition-colors">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="badge badge-ghost badge-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="group-hover:text-primary mt-3 text-base font-medium transition-colors">
                {post.title}
              </h3>
              <p className="text-base-content/50 mt-1 line-clamp-2 text-sm leading-relaxed">
                {post.description}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <FiCalendar className="text-base-content/30 h-3 w-3" />
                <span className="text-base-content/40 text-xs">
                  {post.date}
                </span>
                <FiArrowRight className="group-hover:text-primary ml-auto h-4 w-4 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
          <div className="text-base-content/20 text-4xl">&oslash;</div>
          <p className="text-base-content/50 text-sm">
            No posts tagged &ldquo;{activeTag}&rdquo;.
          </p>
          <button
            onClick={() => setActiveTag(null)}
            className="btn btn-primary btn-sm">
            Clear filter
          </button>
        </div>
      )}
    </PageShell>
  );
};

BlogListTemplate.displayName = 'BlogListTemplate';
