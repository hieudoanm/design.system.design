import type { FC } from 'react';

interface PodcastItem {
  id: string;
  title: string;
  host: string;
  episodes: number;
  category: string;
}

interface PodcastHubProps {
  podcasts: PodcastItem[];
  title?: string;
  onOpen?: (id: string) => void;
}

export const PodcastHub: FC<PodcastHubProps> = ({
  podcasts,
  title = 'Podcasts',
  onOpen,
}) => {
  return (
    <section data-testid="podcast-hub" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <button type="button" className="btn btn-ghost btn-sm">
          Browse all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {podcasts.map((podcast) => (
          <article key={podcast.id} className="card bg-base-200">
            <div className="card-body gap-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-base-content/50 text-xs">
                  {podcast.category}
                </span>
                <span className="badge badge-outline badge-sm">
                  {podcast.episodes} eps
                </span>
              </div>
              <h3 className="text-sm font-medium">{podcast.title}</h3>
              <p className="text-base-content/50 text-xs">
                Hosted by {podcast.host}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-xs mt-2 self-start"
                onClick={() => onOpen?.(podcast.id)}>
                Open podcast
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
