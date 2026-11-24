import type { FC } from 'react';

interface RelatedPost {
  title: string;
  href?: string;
  readTime?: string;
}

interface RelatedPostsProps {
  title?: string;
  posts: RelatedPost[];
}

export const RelatedPosts: FC<RelatedPostsProps> = ({
  title = 'Related posts',
  posts,
}) => (
  <section data-testid="related-posts" className="flex flex-col gap-3">
    <h2 className="text-xl font-bold">{title}</h2>
    {posts.length === 0 ? (
      <p className="text-base-content/40 text-sm">No related posts yet.</p>
    ) : (
      <ul className="divide-base-content/10 flex flex-col divide-y">
        {posts.map((post) => (
          <li key={post.title} className="py-3">
            <a href={post.href ?? '#'} className="font-medium hover:underline">
              {post.title}
            </a>
            {post.readTime && (
              <span className="text-base-content/50 ml-2 text-sm">
                {post.readTime}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);

RelatedPosts.displayName = 'RelatedPosts';
