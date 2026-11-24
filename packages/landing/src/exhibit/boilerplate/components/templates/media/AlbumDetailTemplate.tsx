'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';

interface Track {
  number: number;
  title: string;
  duration: string;
}

const ALBUM = {
  title: 'Horizon Line',
  artist: 'Nova Ember',
  year: '2026',
};

const TRACKS: Track[] = [
  { number: 1, title: 'First Light', duration: '3:45' },
  { number: 2, title: 'Static Bloom', duration: '4:02' },
  { number: 3, title: 'Half Past Nowhere', duration: '3:58' },
  { number: 4, title: 'Glass Harbor', duration: '4:31' },
  { number: 5, title: 'Slow Current', duration: '3:22' },
  { number: 6, title: 'Signal Fade', duration: '4:07' },
  { number: 7, title: 'Amber Sky', duration: '3:40' },
  { number: 8, title: 'Trail of Sparks', duration: '4:26' },
  { number: 9, title: 'Distant Bells', duration: '3:54' },
  { number: 10, title: 'Wide Awake', duration: '4:13' },
  { number: 11, title: 'North Wind', duration: '3:31' },
  { number: 12, title: 'Horizon Line Reprise', duration: '4:31' },
];

const toSeconds = (duration: string) => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

const totalMinutes = Math.round(
  TRACKS.reduce((sum, track) => sum + toSeconds(track.duration), 0) / 60
);

export const AlbumDetailTemplate: FC = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Album</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Album details and track list.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body gap-2 p-5">
            <h2 className="text-xl font-bold tracking-tight">{ALBUM.title}</h2>
            <p className="text-base-content/50 text-sm">{ALBUM.artist}</p>
            <p className="text-base-content/50 text-sm">{ALBUM.year}</p>
            <p className="text-base-content/50 text-sm">
              {TRACKS.length} tracks
            </p>
            <p className="text-base-content/50 text-sm">{totalMinutes} min</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="badge badge-neutral badge-sm">Album</span>
              {playing ? (
                <span className="badge badge-info badge-sm">Playing</span>
              ) : (
                <span className="badge badge-neutral badge-sm">Paused</span>
              )}
              <button
                onClick={() => setPlaying((prev) => !prev)}
                className="btn btn-primary btn-sm gap-1">
                {playing ? <FiPause /> : <FiPlay />}
                {playing ? 'Pause album' : 'Play album'}
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {TRACKS.map((track) => (
                    <tr
                      key={track.number}
                      className="border-base-content/10 border-b">
                      <td className="text-base-content/50 px-4 py-3 text-sm">
                        {track.number}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {track.title}
                      </td>
                      <td className="text-base-content/50 px-4 py-3 text-sm">
                        {track.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

AlbumDetailTemplate.displayName = 'AlbumDetailTemplate';
