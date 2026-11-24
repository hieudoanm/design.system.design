import type { FC } from 'react';

interface VideoStoryProps {
  title: string;
  duration: string;
  channel?: string;
  views?: string;
  href?: string;
  onPlay?: () => void;
}

export const VideoStory: FC<VideoStoryProps> = ({
  title,
  duration,
  channel,
  views,
  href,
  onPlay,
}) => (
  <article
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="video-story">
    <figure className="bg-base-300 relative aspect-video">
      <button
        type="button"
        aria-label="Play video"
        onClick={onPlay}
        className="btn btn-circle btn-primary absolute inset-0 m-auto opacity-90">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <figcaption className="badge badge-neutral absolute right-2 bottom-2 border-0 text-xs">
        {duration}
      </figcaption>
    </figure>
    <div className="card-body gap-2">
      {href ? (
        <a href={href} className="link link-hover card-title text-base">
          {title}
        </a>
      ) : (
        <h3 className="card-title text-base">{title}</h3>
      )}
      {(channel || views) && (
        <p className="text-base-content/50 text-xs">
          {channel && <span>{channel}</span>}
          {channel && views && <span aria-hidden> · </span>}
          {views && <span>{views}</span>}
        </p>
      )}
    </div>
  </article>
);
