'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMusic, FiShuffle, FiTrash2 } from 'react-icons/fi';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
}

const INITIAL_SONGS: Song[] = [
  { id: 's1', title: 'Golden Hour', artist: 'Aria Wells', duration: '4:12' },
  {
    id: 's2',
    title: 'City Lights',
    artist: 'The Midnight Echo',
    duration: '3:28',
  },
  { id: 's3', title: 'Wildflower', artist: 'Juno Park', duration: '5:04' },
  { id: 's4', title: 'Open Road', artist: 'Delta Rivers', duration: '3:47' },
  { id: 's5', title: 'Slow Motion', artist: 'Cora Lane', duration: '4:01' },
];

export const PlaylistTemplate: FC = () => {
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [shuffle, setShuffle] = useState(false);

  const removeSong = (id: string) => {
    setSongs((prev) => prev.filter((song) => song.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Playlist</h1>
        <p className="text-base-content/50 mt-1 text-sm">Your curated mix.</p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setShuffle((prev) => !prev)}
            className="btn btn-outline btn-sm gap-1">
            <FiShuffle />
            {shuffle ? 'Shuffle on' : 'Shuffle'}
          </button>
          <p className="text-base-content/50 text-sm">{songs.length} songs</p>
        </div>

        {songs.length === 0 ? (
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body items-center gap-2 p-10 text-center">
              <FiMusic className="text-base-content/20 h-8 w-8" />
              <p className="text-base-content/50 text-sm">No songs</p>
            </div>
          </div>
        ) : (
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-0">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                  <FiMusic className="text-base-content/30 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{song.title}</p>
                    <p className="text-base-content/50 text-xs">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-base-content/50 text-xs">
                    {song.duration}
                  </span>
                  <button
                    onClick={() => removeSong(song.id)}
                    className="btn btn-ghost btn-xs text-error gap-1">
                    <FiTrash2 />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

PlaylistTemplate.displayName = 'PlaylistTemplate';
