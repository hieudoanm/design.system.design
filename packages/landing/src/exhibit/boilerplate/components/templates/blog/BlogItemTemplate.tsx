'use client';

import type { FC } from 'react';
import {
  FiClock,
  FiCalendar,
  FiTag,
  FiArrowRight,
  FiUser,
} from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

interface PostMeta {
  slug: string;
  title: string;
  date: string;
}

export interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  coverImage?: string;
  readingTime?: number;
}

interface BlogTemplateProps {
  post: BlogPostData;
  recentPosts: PostMeta[];
}

export const BlogItemTemplate: FC<BlogTemplateProps> = ({
  post,
  recentPosts,
}) => {
  const related = recentPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <PageShell
      title={post.title}
      backHref="/blog"
      maxWidth="max-w-3xl"
      gap="gap-8">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5">
          <FiUser className="text-base-content/40 h-3.5 w-3.5" />
          {post.author}
        </span>
        <span className="text-base-content/20">&middot;</span>
        <span className="flex items-center gap-1.5">
          <FiCalendar className="text-base-content/40 h-3.5 w-3.5" />
          {post.date}
        </span>
        {post.readingTime && (
          <>
            <span className="text-base-content/20">&middot;</span>
            <span className="flex items-center gap-1.5">
              <FiClock className="text-base-content/40 h-3.5 w-3.5" />
              {post.readingTime} min read
            </span>
          </>
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="badge badge-ghost badge-sm gap-1">
              <FiTag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Cover image */}
      {post.coverImage && (
        <div className="bg-base-200 overflow-hidden rounded-2xl">
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Description */}
      <p className="text-base-content/60 text-lg leading-relaxed">
        {post.description}
      </p>

      {/* Content */}
      <div className="text-base-content/80 prose prose-sm max-w-none leading-relaxed">
        {post.content}
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-base-content/10 mt-8 border-t pt-8">
          <h2 className="mb-4 text-lg">Continue reading</h2>
          <div className="flex flex-col gap-3">
            {related.map(({ slug, title, date }) => (
              <a
                key={slug}
                href={`/blog/${slug}`}
                className="border-base-content/10 bg-base-200 hover:border-primary/50 flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-base-content/50 text-xs">{date}</p>
                </div>
                <FiArrowRight className="text-base-content/30 h-4 w-4 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
};

BlogItemTemplate.displayName = 'BlogItemTemplate';
