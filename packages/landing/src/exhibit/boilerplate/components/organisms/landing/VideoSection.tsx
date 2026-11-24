import type { FC } from 'react';

interface VideoSectionProps {
  title?: string;
  src?: string;
  videoId?: string;
  poster?: string;
  className?: string;
}

const buildYouTubeEmbedUrl = (videoId: string): string =>
  `https://www.youtube-nocookie.com/embed/${videoId}`;

export const VideoSection: FC<VideoSectionProps> = ({
  title,
  src,
  videoId,
  poster,
  className = '',
}) => (
  <section className={`flex w-full flex-col gap-3 ${className}`}>
    {title && <h2 className="text-xl font-semibold">{title}</h2>}
    <div className="border-base-content/10 aspect-video w-full overflow-hidden rounded-xl border">
      {videoId ? (
        <iframe
          className="h-full w-full"
          src={buildYouTubeEmbedUrl(videoId)}
          title={title ?? 'Embedded video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : src ? (
        <video
          className="h-full w-full object-cover"
          controls
          poster={poster}
          title={title ?? 'Embedded video'}>
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="bg-base-200 text-base-content/40 flex h-full w-full items-center justify-center">
          No video source provided
        </div>
      )}
    </div>
  </section>
);

VideoSection.displayName = 'VideoSection';
