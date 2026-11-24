'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCamera, FiClock, FiMapPin } from 'react-icons/fi';

type GuideCategory = 'Culture' | 'Food' | 'Outdoors';

interface Guide {
  id: string;
  title: string;
  destination: string;
  readTime: number;
  category: GuideCategory;
  saved: boolean;
}

const GUIDES: Guide[] = [
  {
    id: 'g1',
    title: 'Street Food Tour of Hanoi',
    destination: 'Hanoi, Vietnam',
    readTime: 8,
    category: 'Food',
    saved: false,
  },
  {
    id: 'g2',
    title: 'Temples of Kyoto',
    destination: 'Kyoto, Japan',
    readTime: 12,
    category: 'Culture',
    saved: false,
  },
  {
    id: 'g3',
    title: 'Trekking Sapa Valleys',
    destination: 'Sapa, Vietnam',
    readTime: 15,
    category: 'Outdoors',
    saved: false,
  },
  {
    id: 'g4',
    title: 'Beaches of Bali',
    destination: 'Bali, Indonesia',
    readTime: 9,
    category: 'Outdoors',
    saved: false,
  },
  {
    id: 'g5',
    title: 'Floating Markets Guide',
    destination: 'Bangkok, Thailand',
    readTime: 7,
    category: 'Culture',
    saved: false,
  },
];

const getCategoryClass = (category: GuideCategory) => {
  if (category === 'Food') return 'badge-warning';
  if (category === 'Outdoors') return 'badge-success';
  return 'badge-info';
};

export const TravelGuidesTemplate: FC = () => {
  const [guides, setGuides] = useState<Guide[]>(GUIDES);

  const toggleSave = (id: string) => {
    setGuides((prev) =>
      prev.map((guide) =>
        guide.id === id ? { ...guide, saved: !guide.saved } : guide
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Guides</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Travel tips and guides.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {guides.length} guides
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="bg-base-content/10 flex h-16 items-center justify-center rounded-lg">
                  <FiCamera className="text-base-content/30 h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">{guide.title}</p>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiMapPin className="h-3 w-3" />
                    {guide.destination}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${getCategoryClass(guide.category)} badge-sm`}>
                      {guide.category}
                    </span>
                    <span className="text-base-content/50 flex items-center gap-1 text-xs">
                      <FiClock className="h-3 w-3" />
                      {guide.readTime} min read
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {guide.saved && (
                      <span className="badge badge-success badge-sm">
                        Saved
                      </span>
                    )}
                    <button
                      onClick={() => toggleSave(guide.id)}
                      className="btn btn-primary btn-sm">
                      Save guide
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

TravelGuidesTemplate.displayName = 'TravelGuidesTemplate';
