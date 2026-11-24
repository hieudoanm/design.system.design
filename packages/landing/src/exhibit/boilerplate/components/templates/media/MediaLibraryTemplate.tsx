'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

type AssetType = 'Image' | 'Video' | 'Audio' | 'Document';
type TypeFilter = 'All' | AssetType;

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  size: string;
}

const ASSETS: Asset[] = [
  { id: 'a1', name: 'hero-banner.png', type: 'Image', size: '2.4 MB' },
  { id: 'a2', name: 'product-demo.mp4', type: 'Video', size: '84 MB' },
  { id: 'a3', name: 'intro-audio.mp3', type: 'Audio', size: '6.1 MB' },
  { id: 'a4', name: 'privacy-policy.pdf', type: 'Document', size: '180 KB' },
  { id: 'a5', name: 'team-photo.jpg', type: 'Image', size: '3.8 MB' },
  { id: 'a6', name: 'walkthrough.mp4', type: 'Video', size: '120 MB' },
  { id: 'a7', name: 'podcast-ep1.mp3', type: 'Audio', size: '22 MB' },
  { id: 'a8', name: 'terms-of-service.pdf', type: 'Document', size: '95 KB' },
];

const FILTERS: TypeFilter[] = ['All', 'Image', 'Video', 'Audio', 'Document'];

export const MediaLibraryTemplate: FC = () => {
  const [assets, setAssets] = useState<Asset[]>(ASSETS);
  const [filter, setFilter] = useState<TypeFilter>('All');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = assets.filter(
    (asset) =>
      (filter === 'All' || asset.type === filter) &&
      asset.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    setAssets((prev) =>
      prev.filter((asset) => !selectedIds.includes(asset.id))
    );
    setSelectedIds([]);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Browse and manage uploaded assets.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            aria-label="Search assets"
            placeholder="Search assets..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input input-bordered input-sm w-full sm:w-64"
          />
          <div className="flex items-center gap-3">
            <p className="text-base-content/50 text-sm">
              {filtered.length} assets
            </p>
            <button
              onClick={deleteSelected}
              disabled={selectedIds.length === 0}
              className="btn btn-error btn-sm gap-1">
              <FiTrash2 />
              Delete selected ({selectedIds.length})
            </button>
          </div>
        </div>

        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`tab ${filter === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-base-content/50 text-sm">No assets found</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-4">
                  <div className="bg-primary/10 text-primary flex h-16 items-center justify-center rounded-lg text-xs font-medium">
                    {asset.type}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-base-content/50 text-xs">{asset.size}</p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      aria-label={`Select ${asset.name}`}
                      checked={selectedIds.includes(asset.id)}
                      onChange={() => toggleSelect(asset.id)}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Select
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

MediaLibraryTemplate.displayName = 'MediaLibraryTemplate';
