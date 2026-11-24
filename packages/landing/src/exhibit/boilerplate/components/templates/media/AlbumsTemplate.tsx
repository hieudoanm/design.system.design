'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';

interface Album {
  id: string;
  title: string;
  photos: string[];
}

const INITIAL_ALBUMS: Album[] = [
  {
    id: 'al1',
    title: 'Summer trip',
    photos: ['Beach sunset', 'City night', 'Harbor morning', 'Boardwalk'],
  },
  {
    id: 'al2',
    title: 'Product launch',
    photos: ['Stage setup', 'Keynote', 'Team photo', 'After-party', 'Booth'],
  },
  {
    id: 'al3',
    title: 'Wedding',
    photos: ['Ceremony', 'First dance', 'Reception', 'Cake cutting', 'Goodbye'],
  },
];

export const AlbumsTemplate: FC = () => {
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState('');

  const createAlbum = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Enter an album title');
      return;
    }
    setAlbums((prev) => [
      ...prev,
      { id: `album${Date.now()}`, title: trimmed, photos: [] },
    ]);
    setTitle('');
    setError('');
    setCreated('Album created');
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Albums</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Organize photos into albums.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <input
              aria-label="Album title"
              placeholder="e.g. Summer trip"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="input input-bordered input-sm w-full sm:flex-1"
            />
            <button
              onClick={createAlbum}
              className="btn btn-primary btn-sm gap-1">
              <FiPlus />
              Create album
            </button>
          </div>
          {error && (
            <p className="text-error px-5 pb-4 text-sm" role="alert">
              {error}
            </p>
          )}
          {created && (
            <p className="text-success px-5 pb-4 text-sm">{created}</p>
          )}
        </div>

        <p className="text-base-content/50 mb-4 text-sm">
          {albums.length} albums
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {albums.map((album) => (
            <div
              key={album.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{album.title}</p>
                    <p className="text-base-content/50 text-xs">
                      {album.photos.length} photos
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExpand(album.id)}
                    className="btn btn-ghost btn-xs gap-1">
                    {expandedId === album.id ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                    {expandedId === album.id ? 'Hide photos' : 'View photos'}
                  </button>
                </div>
                {expandedId === album.id && (
                  <div className="mt-3">
                    {album.photos.length === 0 ? (
                      <p className="text-base-content/50 text-xs">
                        No photos yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {album.photos.map((photo) => (
                          <div
                            key={photo}
                            className="bg-primary/10 text-primary flex h-16 items-center justify-center rounded-lg text-center text-xs">
                            {photo}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

AlbumsTemplate.displayName = 'AlbumsTemplate';
