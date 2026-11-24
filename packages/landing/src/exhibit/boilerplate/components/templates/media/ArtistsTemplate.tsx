'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiUsers } from 'react-icons/fi';

interface Artist {
  id: string;
  name: string;
  genre: string;
  followers: string;
  following: boolean;
}

const ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'Luna Vega',
    genre: 'Synthpop',
    followers: '1.2M',
    following: false,
  },
  {
    id: 'a2',
    name: 'Nova Ember',
    genre: 'Alt Rock',
    followers: '860K',
    following: false,
  },
  {
    id: 'a3',
    name: 'Kaito Rei',
    genre: 'Electronic',
    followers: '2.4M',
    following: false,
  },
  {
    id: 'a4',
    name: 'Maya Fields',
    genre: 'Indie Folk',
    followers: '540K',
    following: false,
  },
];

export const ArtistsTemplate: FC = () => {
  const [artists, setArtists] = useState<Artist[]>(ARTISTS);

  const toggleFollow = (id: string) => {
    setArtists((prev) =>
      prev.map((artist) =>
        artist.id === id ? { ...artist, following: !artist.following } : artist
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Artists</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Follow your favorites.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {ARTISTS.length} artists
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {artist.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{artist.name}</p>
                      <p className="text-base-content/50 text-xs">
                        {artist.genre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {artist.following && (
                      <span className="badge badge-success badge-sm">
                        Following
                      </span>
                    )}
                    <button
                      onClick={() => toggleFollow(artist.id)}
                      className="btn btn-primary btn-sm gap-1">
                      <FiPlus />
                      Follow
                    </button>
                  </div>
                </div>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiUsers className="h-3.5 w-3.5" />
                  {artist.followers} followers
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

ArtistsTemplate.displayName = 'ArtistsTemplate';
