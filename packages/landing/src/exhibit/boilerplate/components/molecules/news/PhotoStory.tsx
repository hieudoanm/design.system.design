import type { FC } from 'react';

interface PhotoStoryProps {
  title: string;
  caption?: string;
  photographer?: string;
  href?: string;
}

export const PhotoStory: FC<PhotoStoryProps> = ({
  title,
  caption,
  photographer,
  href,
}) => (
  <article
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="photo-story">
    <figure className="bg-base-300 relative aspect-[4/3]">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="text-base-content/30 absolute inset-0 m-auto h-10 w-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 15l-5-5-9 9" />
      </svg>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm text-white">
          {caption}
        </figcaption>
      )}
    </figure>
    <div className="card-body gap-1">
      {href ? (
        <a href={href} className="link link-hover card-title text-base">
          {title}
        </a>
      ) : (
        <h3 className="card-title text-base">{title}</h3>
      )}
      {photographer && (
        <span className="text-base-content/50 text-xs">
          Photo by {photographer}
        </span>
      )}
    </div>
  </article>
);
