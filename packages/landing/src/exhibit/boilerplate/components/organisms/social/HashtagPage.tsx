import type { FC } from 'react';

interface HashtagPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
}

interface HashtagStats {
  posts: number;
  followers: number;
}

interface HashtagPageProps {
  hashtag: string;
  stats: HashtagStats;
  posts: HashtagPost[];
}

export const HashtagPage: FC<HashtagPageProps> = ({
  hashtag,
  stats,
  posts,
}) => {
  return (
    <section data-testid="hashtag-page" className="flex flex-col gap-4">
      <header className="card bg-base-200">
        <div className="card-body gap-1">
          <h1 className="text-2xl font-medium">#{hashtag}</h1>
          <p className="text-base-content/50 text-sm">
            {stats.posts.toLocaleString()} posts &middot;{' '}
            {stats.followers.toLocaleString()} followers
          </p>
          <button type="button" className="btn btn-primary btn-sm mt-2 w-fit">
            Follow
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="card bg-base-200">
            <div className="card-body gap-2">
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content w-8 rounded-full">
                    <span className="text-xs">{post.author.charAt(0)}</span>
                  </div>
                </div>
                <span className="text-sm font-medium">{post.author}</span>
              </div>
              <p>{post.content}</p>
              <p className="text-base-content/50 text-xs">
                <span aria-hidden="true">&#10084;</span> {post.likes} likes
                &middot; {post.comments} comments
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
