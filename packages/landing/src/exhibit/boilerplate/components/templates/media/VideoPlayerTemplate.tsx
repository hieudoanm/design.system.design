'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';

interface Video {
  id: string;
  title: string;
  duration: string;
}

const VIDEOS: Video[] = [
  { id: 'v1', title: 'Product demo', duration: '4:32' },
  { id: 'v2', title: 'Team intro', duration: '2:10' },
  { id: 'v3', title: 'Feature walkthrough', duration: '8:05' },
  { id: 'v4', title: 'Q&A session', duration: '15:48' },
  { id: 'v5', title: 'Release notes', duration: '3:27' },
];

export const VideoPlayerTemplate: FC = () => {
  const [selectedId, setSelectedId] = useState<string>(VIDEOS[0].id);
  const [playing, setPlaying] = useState(false);

  const selected = VIDEOS.find((video) => video.id === selectedId) ?? VIDEOS[0];

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Video Player</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Watch recorded content.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {VIDEOS.length} videos in playlist
        </p>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-1 md:w-64">
            {VIDEOS.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedId(video.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                  video.id === selectedId ? 'bg-base-300' : 'bg-transparent'
                }`}>
                <span>{video.title}</span>
                <span className="text-base-content/50 text-xs">
                  {video.duration}
                </span>
              </button>
            ))}
          </div>

          <div className="card bg-base-200 border-base-content/10 flex-1 border">
            <div className="card-body p-5">
              <div className="bg-base-content/10 flex h-40 items-center justify-center rounded-xl">
                <p className="text-base-content/50 text-sm">{selected.title}</p>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Now playing: {selected.title}
                  </p>
                  <p className="text-base-content/50 text-xs">
                    Duration {selected.duration}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {playing ? (
                    <span className="badge badge-success badge-sm">
                      Playing
                    </span>
                  ) : (
                    <span className="badge badge-neutral badge-sm">Paused</span>
                  )}
                  <button
                    onClick={() => setPlaying((prev) => !prev)}
                    className="btn btn-primary btn-sm gap-1">
                    {playing ? <FiPause /> : <FiPlay />}
                    {playing ? 'Pause' : 'Play'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

VideoPlayerTemplate.displayName = 'VideoPlayerTemplate';
