'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBookmark, FiCalendar, FiClock, FiThumbsUp } from 'react-icons/fi';

const TITLE = 'The Future of Urban Transit Is Electric';
const AUTHOR = 'Maya Chen';
const PUBLISHED = 'Aug 5, 2026';
const READ_TIME = 6;

const PARAGRAPHS = [
  'Electric buses, bikes and rail are quietly reshaping how cities move. Ridership on electric transit routes has climbed 34% over the past year, and planners are betting the trend is only beginning.',
  'Battery costs have fallen far enough that fleets can now pay for themselves in fuel savings alone. Meanwhile, wireless charging pads embedded in road surfaces keep vehicles running through the longest shifts.',
  'Challenges remain. Older grids struggle to power peak-hour charging, and rural routes still lack the density to justify new infrastructure. Cities are pairing federal grants with congestion pricing to close the gap.',
  'The coming decade will tell whether electric transit becomes the default or remains a boutique experiment. Early signals, from Oslo to Bogotá, suggest momentum is hard to reverse.',
];

export const ArticleTemplate: FC = () => {
  const [likes, setLikes] = useState(128);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const toggleLike = () => {
    if (liked) {
      setLikes((current) => current - 1);
    } else {
      setLikes((current) => current + 1);
    }
    setLiked((current) => !current);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Article</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Read the full story.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <article className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <h2 className="text-xl font-bold tracking-tight">{TITLE}</h2>
            <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-base-content font-medium">{AUTHOR}</span>
              <span className="flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5" />
                {PUBLISHED}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="h-3.5 w-3.5" />
                {READ_TIME} min read
              </span>
            </p>

            <div className="flex flex-col gap-4">
              {PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="border-base-content/10 mt-2 flex flex-wrap items-center gap-3 border-t pt-4">
              <button
                onClick={toggleLike}
                className="btn btn-ghost btn-sm gap-1">
                <FiThumbsUp className="h-4 w-4" />
                {liked ? 'Unlike' : 'Like'}
              </button>
              <span className="text-base-content/50 text-sm">
                {likes} likes
              </span>
              <button
                onClick={() => setBookmarked((current) => !current)}
                className={`btn btn-sm gap-1 ${
                  bookmarked ? 'badge badge-info' : 'btn-ghost'
                }`}>
                <FiBookmark className="h-4 w-4" />
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

ArticleTemplate.displayName = 'ArticleTemplate';
