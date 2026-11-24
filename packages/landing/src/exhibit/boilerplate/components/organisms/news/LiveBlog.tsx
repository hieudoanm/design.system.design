'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface LivePost {
  time: string;
  author: string;
  text: string;
}

interface LiveBlogProps {
  posts: LivePost[];
  title?: string;
  author?: string;
}

export const LiveBlog: FC<LiveBlogProps> = ({
  posts,
  title = 'Live Blog',
  author = 'Live Desk',
}) => {
  const [entries, setEntries] = useState<LivePost[]>(posts);
  const [text, setText] = useState('');

  const append = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setEntries((current) => [
      {
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        author,
        text: trimmed,
      },
      ...current,
    ]);
    setText('');
  };

  return (
    <section data-testid="live-blog" className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="badge badge-error gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
          Live
        </span>
        <h2>{title}</h2>
      </div>
      <ul className="timeline timeline-vertical timeline-snap-icon max-md:timeline-compact">
        {entries.map((post, index) => (
          <li key={index}>
            <div className="timeline-middle text-base-content/50">
              <span aria-hidden="true">&#9679;</span>
            </div>
            <div
              className={`card bg-base-200 border-base-content/10 mb-4 rounded-xl border p-4 ${
                index === 0 ? 'border-primary timeline-start' : 'timeline-end'
              }`}>
              <div className="flex items-center gap-2">
                <time className="text-base-content/50 text-xs">
                  {post.time}
                </time>
                <span className="badge badge-ghost badge-sm">
                  {post.author}
                </span>
              </div>
              <p className="text-sm">{post.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <form className="flex w-full gap-2" onSubmit={append}>
        <input
          type="text"
          aria-label="Live update"
          data-testid="live-blog-input"
          className="input input-bordered input-sm flex-1"
          value={text}
          placeholder="Post an update..."
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Post
        </button>
      </form>
    </section>
  );
};
