import type { FC } from 'react';

interface Comment {
  id: string;
  author: string;
  content: string;
  time?: string;
  likes?: number;
}

interface CommentListProps {
  comments: Comment[];
  title?: string;
}

export const CommentList: FC<CommentListProps> = ({
  comments,
  title = 'Comments',
}) => (
  <section
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="comment-list">
    <div className="card-body gap-3">
      <h3 className="card-title text-base">{title}</h3>
      {comments.length === 0 ? (
        <p className="text-base-content/50 text-sm">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content w-8 rounded-full">
                  <span className="text-xs">
                    {comment.author.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">
                    {comment.author}
                  </span>
                  {comment.time && (
                    <time className="text-base-content/50 text-xs">
                      {comment.time}
                    </time>
                  )}
                </div>
                <p className="text-base-content/80 text-sm">
                  {comment.content}
                </p>
                {comment.likes !== undefined && (
                  <span className="text-base-content/50 text-xs">
                    {comment.likes} likes
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);
