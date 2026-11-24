import type { FC } from 'react';

interface PostCardProps {
  author: string;
  content: string;
  likes?: number;
  comments?: number;
  shares?: number;
  time?: string;
  avatar?: string;
}

export const PostCard: FC<PostCardProps> = ({
  author,
  content,
  likes = 0,
  comments = 0,
  shares = 0,
  time,
  avatar,
}) => (
  <article
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="post-card">
    <div className="card-body gap-3">
      <header className="flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content w-10 rounded-full">
            <span>{avatar ?? author.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{author}</span>
          {time && <time className="text-base-content/50 text-xs">{time}</time>}
        </div>
      </header>
      <p className="text-sm">{content}</p>
      <footer className="border-base-300 text-base-content/60 flex items-center gap-4 border-t pt-3 text-xs">
        <span className="flex items-center gap-1">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {likes}
        </span>
        <span className="flex items-center gap-1">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          {comments}
        </span>
        <span className="flex items-center gap-1">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          {shares}
        </span>
      </footer>
    </div>
  </article>
);
