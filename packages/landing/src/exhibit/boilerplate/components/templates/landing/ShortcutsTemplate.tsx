'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCopy, FiSearch } from 'react-icons/fi';

type Category = 'Navigation' | 'Editing' | 'Actions';

interface Shortcut {
  id: string;
  category: Category;
  keys: string;
  description: string;
}

const CATEGORIES: Category[] = ['Navigation', 'Editing', 'Actions'];

const SHORTCUTS: Shortcut[] = [
  {
    id: 's1',
    category: 'Navigation',
    keys: 'G + H',
    description: 'Go to home',
  },
  {
    id: 's2',
    category: 'Navigation',
    keys: 'G + P',
    description: 'Go to profile',
  },
  { id: 's3', category: 'Editing', keys: 'C', description: 'Create new item' },
  {
    id: 's4',
    category: 'Editing',
    keys: 'Cmd + D',
    description: 'Duplicate selection',
  },
  {
    id: 's5',
    category: 'Actions',
    keys: 'Cmd + S',
    description: 'Save changes',
  },
  {
    id: 's6',
    category: 'Actions',
    keys: 'Cmd + K',
    description: 'Open command palette',
  },
  {
    id: 's7',
    category: 'Actions',
    keys: 'Cmd + /',
    description: 'Show shortcuts',
  },
];

export const ShortcutsTemplate: FC = () => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const filtered = SHORTCUTS.filter(
    (shortcut) =>
      shortcut.keys.toLowerCase().includes(query) ||
      shortcut.description.toLowerCase().includes(query)
  );

  const copyShortcut = (id: string) => {
    setCopiedId(id);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Shortcuts</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Move faster with keyboard shortcuts.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="relative mb-6 w-full max-w-xs">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shortcuts..."
            className="input input-bordered input-sm bg-base-200 w-full pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-base-content/50 text-sm">No shortcuts found</p>
        ) : (
          <div className="flex flex-col gap-6">
            {CATEGORIES.map((category) => {
              const shortcuts = filtered.filter((s) => s.category === category);
              if (shortcuts.length === 0) return null;
              return (
                <section key={category}>
                  <h3 className="text-base-content/50 mb-3 text-xs font-semibold tracking-wider uppercase">
                    {category}
                  </h3>
                  <div className="card bg-base-200 border-base-content/10 border">
                    <div className="card-body p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                              <th className="px-4 py-3 font-medium">
                                Shortcut
                              </th>
                              <th className="px-4 py-3 font-medium">
                                Description
                              </th>
                              <th className="px-4 py-3 text-right font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {shortcuts.map((shortcut) => (
                              <tr
                                key={shortcut.id}
                                className="border-base-content/10 border-b">
                                <td className="px-4 py-3">
                                  <kbd className="bg-base-300 text-base-content rounded border px-2 py-1 font-mono text-xs">
                                    {shortcut.keys}
                                  </kbd>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {shortcut.description}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {copiedId === shortcut.id ? (
                                    <span className="text-success text-xs font-medium">
                                      Copied!
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => copyShortcut(shortcut.id)}
                                      className="btn btn-ghost btn-xs">
                                      <FiCopy />
                                      Copy
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

ShortcutsTemplate.displayName = 'ShortcutsTemplate';
