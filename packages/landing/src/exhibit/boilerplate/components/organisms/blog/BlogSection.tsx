import type { FC } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  tag?: string;
}

interface BlogSectionProps {
  posts: BlogPost[];
  title?: string;
}

export const BlogSection: FC<BlogSectionProps> = ({
  posts,
  title = 'Latest posts',
}) => (
  <section className="py-10">
    <h2 className="mb-6 text-center text-2xl">{title}</h2>
    <div className="grid gap-4 md:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            {post.tag && (
              <span className="badge badge-ghost badge-sm">{post.tag}</span>
            )}
            <h3 className="text-base">{post.title}</h3>
            {post.excerpt && (
              <p className="text-base-content/50 text-sm">{post.excerpt}</p>
            )}
            {post.date && (
              <time className="text-base-content/40 mt-2 text-xs">
                {post.date}
              </time>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);
