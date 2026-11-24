'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiFlag } from 'react-icons/fi';

type Phase = 'Now' | 'Next' | 'Later';

interface RoadmapItem {
  id: string;
  title: string;
  phase: Phase;
}

const PHASES: Phase[] = ['Now', 'Next', 'Later'];

const INITIAL_ITEMS: RoadmapItem[] = [
  { id: 'r1', title: 'Launch billing v2', phase: 'Now' },
  { id: 'r2', title: 'Dark mode', phase: 'Now' },
  { id: 'r3', title: 'Mobile app', phase: 'Next' },
  { id: 'r4', title: 'Team mentions', phase: 'Next' },
  { id: 'r5', title: 'AI assistant', phase: 'Later' },
  { id: 'r6', title: 'Offline mode', phase: 'Later' },
];

const PHASE_INDEX: Record<Phase, number> = { Now: 0, Next: 1, Later: 2 };

export const RoadmapTemplate: FC = () => {
  const [items, setItems] = useState<RoadmapItem[]>(INITIAL_ITEMS);

  const move = (id: string, direction: -1 | 1) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextIndex = PHASE_INDEX[item.phase] + direction;
        if (nextIndex < 0 || nextIndex > PHASES.length - 1) return item;
        return { ...item, phase: PHASES[nextIndex] };
      })
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Plan what your team ships now, next and later.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PHASES.map((phase) => {
            const phaseItems = items.filter((item) => item.phase === phase);
            const count = phaseItems.length;
            return (
              <div
                key={phase}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiFlag className="text-base-content/50 h-4 w-4" />
                      <h3 className="font-semibold">{phase}</h3>
                    </div>
                    <span className="badge badge-ghost badge-sm">
                      {count} item{count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {phaseItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-base-100 border-base-content/10 rounded-lg border px-3 py-2.5">
                        <p className="text-sm font-medium">{item.title}</p>
                        <div className="mt-2 flex justify-end gap-1">
                          <button
                            onClick={() => move(item.id, -1)}
                            disabled={PHASE_INDEX[item.phase] === 0}
                            aria-label={`Move ${item.title} left`}
                            className="btn btn-ghost btn-xs btn-square">
                            <FiChevronLeft />
                          </button>
                          <button
                            onClick={() => move(item.id, 1)}
                            disabled={
                              PHASE_INDEX[item.phase] === PHASES.length - 1
                            }
                            aria-label={`Move ${item.title} right`}
                            className="btn btn-ghost btn-xs btn-square">
                            <FiChevronRight />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

RoadmapTemplate.displayName = 'RoadmapTemplate';
