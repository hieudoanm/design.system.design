import type { FC } from 'react';

interface Podcast {
  title: string;
  host: string;
  duration: string;
  topic: string;
}

interface PodcastFeedProps {
  podcasts: Podcast[];
  title?: string;
}

export const PodcastFeed: FC<PodcastFeedProps> = ({
  podcasts,
  title = 'Podcasts',
}) => (
  <section data-testid="podcast-feed" className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <ul className="flex w-full flex-col gap-3">
      {podcasts.map((podcast, index) => (
        <li
          key={index}
          className="card bg-base-200 border-base-content/10 flex-row items-center gap-4 rounded-xl border p-4">
          <div className="from-primary to-accent flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br">
            <span className="text-primary-content text-lg" aria-hidden="true">
              {'\u25B6'}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-ghost badge-sm">
                {podcast.topic}
              </span>
              <span className="text-base-content/50 text-xs">
                {podcast.duration}
              </span>
            </div>
            <h3 className="text-sm font-medium">{podcast.title}</h3>
            <p className="text-base-content/60 text-xs">
              Hosted by {podcast.host}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-circle btn-sm"
            aria-label={`Play ${podcast.title}`}>
            <span aria-hidden="true">&#9654;</span>
          </button>
        </li>
      ))}
    </ul>
  </section>
);
