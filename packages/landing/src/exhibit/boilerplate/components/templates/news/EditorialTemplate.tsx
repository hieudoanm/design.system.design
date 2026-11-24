'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiPenTool } from 'react-icons/fi';

interface Editorial {
  id: string;
  title: string;
  author: string;
  role: string;
  category: string;
  excerpt: string;
}

const EDITORIALS: Editorial[] = [
  {
    id: 'e1',
    title: 'A New Approach to Digital Privacy',
    author: 'Sarah Okafor',
    role: 'Editor-in-Chief',
    category: 'Policy',
    excerpt:
      'Privacy needs to be designed into products from the first line of code, not bolted on after a breach. We argue for default-encrypted messaging and transparent data practices.',
  },
  {
    id: 'e2',
    title: 'The Case for Slower News Cycles',
    author: 'Tom Bielski',
    role: 'Managing Editor',
    category: 'Media',
    excerpt:
      'When every outlet races to publish first, accuracy becomes the first casualty. Slower, verified reporting serves readers better than a constant stream of updates.',
  },
  {
    id: 'e3',
    title: 'Local Journalism Needs Funding',
    author: 'Lena Fischer',
    role: 'Senior Editor',
    category: 'Community',
    excerpt:
      'Community newsrooms are closing faster than they can be replaced. Public funding and reader cooperatives offer a practical path to keep local reporting alive.',
  },
  {
    id: 'e4',
    title: 'Why Climate Coverage Must Stay Honest',
    author: 'Marcus Reid',
    role: 'Environment Editor',
    category: 'Climate',
    excerpt:
      'Reporting on climate requires hope and honesty in equal measure. Fear alone paralyzes readers, while blind optimism ignores the very real stakes.',
  },
];

export const EditorialTemplate: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Editorial</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Perspectives from our editors.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 flex items-center gap-1.5 text-sm">
          <FiPenTool className="h-3.5 w-3.5" />
          {EDITORIALS.length} editorials
        </p>

        <div className="flex flex-col gap-4">
          {EDITORIALS.map((editorial) => {
            const isOpen = expandedId === editorial.id;
            return (
              <article
                key={editorial.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex flex-col gap-2 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="badge badge-ghost badge-sm">
                      {editorial.category}
                    </span>
                    <button
                      onClick={() => toggle(editorial.id)}
                      className="btn btn-ghost btn-xs gap-1">
                      {isOpen ? 'Close' : 'Read editorial'}
                      {isOpen ? (
                        <FiChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <FiChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <h2 className="text-base font-semibold">{editorial.title}</h2>
                  <p className="text-base-content/50 text-sm">
                    <span>{editorial.author}</span>
                    <span> · {editorial.role}</span>
                  </p>
                  {isOpen && (
                    <p className="text-base-content/70 text-sm">
                      {editorial.excerpt}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

EditorialTemplate.displayName = 'EditorialTemplate';
