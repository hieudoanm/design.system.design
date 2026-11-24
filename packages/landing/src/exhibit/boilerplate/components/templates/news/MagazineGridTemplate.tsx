'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBookmark, FiBookOpen, FiClock } from 'react-icons/fi';

interface Feature {
  id: string;
  title: string;
  author: string;
  section: string;
  readTime: number;
}

const FEATURES: Feature[] = [
  {
    id: 'f1',
    title: 'The Silicon Valley Exodus',
    author: 'Priya Raman',
    section: 'Technology',
    readTime: 12,
  },
  {
    id: 'f2',
    title: "Inside the World's Largest Ocean Cleanup",
    author: 'Dan Whitfield',
    section: 'Environment',
    readTime: 15,
  },
  {
    id: 'f3',
    title: 'How Cities Are Reinventing the Block',
    author: 'Ines Almeida',
    section: 'Cities',
    readTime: 9,
  },
  {
    id: 'f4',
    title: 'The Quiet Rise of Independent Film',
    author: 'Jonas Lindqvist',
    section: 'Culture',
    readTime: 11,
  },
  {
    id: 'f5',
    title: 'What Eight Decades of Spaceflight Taught Us',
    author: 'Clara Mensah',
    section: 'Science',
    readTime: 18,
  },
  {
    id: 'f6',
    title: 'The Economics of a Four-Day Week',
    author: 'Robert Tan',
    section: 'Work',
    readTime: 10,
  },
];

export const MagazineGridTemplate: FC = () => {
  const [saved, setSaved] = useState<string[]>([]);

  const toggleSave = (id: string) =>
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Magazine</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Long reads and features.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 flex items-center gap-1.5 text-sm">
          <FiBookOpen className="h-3.5 w-3.5" />
          {FEATURES.length} features
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const isSaved = saved.includes(feature.id);
            return (
              <article
                key={feature.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex flex-col gap-2 p-5">
                  <h2 className="text-base font-semibold">{feature.title}</h2>
                  <p className="text-base-content/50 text-xs">
                    <span>{feature.author}</span>
                    <span> · {feature.section}</span>
                  </p>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiClock className="h-3 w-3" />
                    {feature.readTime} min read
                  </p>
                  <button
                    onClick={() => toggleSave(feature.id)}
                    className={`btn btn-sm mt-2 w-fit gap-1 ${
                      isSaved ? 'badge badge-success' : 'btn-ghost'
                    }`}>
                    <FiBookmark className="h-3.5 w-3.5" />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

MagazineGridTemplate.displayName = 'MagazineGridTemplate';
