import type { FC } from 'react';

interface Commit {
  id: string;
  message: string;
  author?: string;
  hash?: string;
  time?: string;
  branch?: string;
}

interface GitCommitFeedProps {
  commits: Commit[];
  title?: string;
}

export const GitCommitFeed: FC<GitCommitFeedProps> = ({
  commits,
  title = 'Recent commits',
}) => (
  <section className="py-4">
    <h2 className="mb-4 text-xl">{title}</h2>
    <ol className="border-base-content/10 ml-2 flex flex-col gap-4 border-l">
      {commits.length === 0 && (
        <li className="text-base-content/50 ml-4 text-sm">No commits.</li>
      )}
      {commits.map((commit) => (
        <li key={commit.id} className="relative pl-5">
          <span className="bg-primary absolute top-1.5 left-[-5px] size-2.5 rounded-full" />
          <article className="bg-base-200 border-base-content/10 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">{commit.message}</h3>
              {commit.hash && (
                <span className="font-mono text-xs">{commit.hash}</span>
              )}
            </div>
            <div className="text-base-content/40 mt-1 flex items-center gap-3 text-xs">
              {commit.author && <span>{commit.author}</span>}
              {commit.time && <time>{commit.time}</time>}
              {commit.branch && (
                <span className="badge badge-ghost badge-xs">
                  {commit.branch}
                </span>
              )}
            </div>
          </article>
        </li>
      ))}
    </ol>
  </section>
);
