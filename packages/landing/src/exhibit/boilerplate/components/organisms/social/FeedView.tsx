import type { FC } from 'react';

interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

interface FeedViewProps {
  posts: Post[];
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
}

export const FeedView: FC<FeedViewProps> = ({ posts, onLike, onComment }) => {
  if (posts.length === 0) {
    return (
      <div data-testid="feed" className="flex flex-col gap-4">
        <div className="card bg-base-200">
          <div className="card-body items-center text-center">
            <p className="text-base-content/60">No posts yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="feed" className="flex flex-col gap-4">
      {posts.map((post) => (
        <article key={post.id} className="card bg-base-200">
          <div className="card-body gap-3">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content w-10 rounded-full">
                  <span className="text-sm">{post.author.charAt(0)}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">{post.author}</h3>
                <p className="text-base-content/50 text-xs">{post.time}</p>
              </div>
            </div>
            <p>{post.content}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onLike?.(post.id)}>
                <span aria-hidden="true">&#10084;</span>
                {post.likes}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onComment?.(post.id)}>
                <span aria-hidden="true">&#128172;</span>
                {post.comments}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
