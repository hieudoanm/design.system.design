'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface Swatch {
  id: string;
  name: string;
  bgClass: string;
}

interface Mark {
  id: string;
  cell: number;
  colorClass: string;
}

const SWATCHES: Swatch[] = [
  { id: 'black', name: 'Black', bgClass: 'bg-base-content' },
  { id: 'red', name: 'Red', bgClass: 'bg-red-500' },
  { id: 'blue', name: 'Blue', bgClass: 'bg-blue-500' },
  { id: 'green', name: 'Green', bgClass: 'bg-green-500' },
  { id: 'amber', name: 'Amber', bgClass: 'bg-amber-500' },
  { id: 'purple', name: 'Purple', bgClass: 'bg-purple-500' },
];

const CELLS = Array.from({ length: 24 }, (_, idx) => idx);

export const WhiteboardTemplate: FC = () => {
  const [selectedId, setSelectedId] = useState(SWATCHES[0].id);
  const [marks, setMarks] = useState<Mark[]>([]);

  const selected = SWATCHES.find((s) => s.id === selectedId) ?? SWATCHES[0];

  const paint = (cell: number) => {
    setMarks((prev) => [
      ...prev.filter((m) => m.cell !== cell),
      { id: `${Date.now()}-${cell}`, cell, colorClass: selected.bgClass },
    ]);
  };

  const clear = () => {
    setMarks([]);
    setSelectedId(SWATCHES[0].id);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Whiteboard</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Sketch out ideas on a shared canvas.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                Selected color:{' '}
                <span className="font-semibold">{selected.name}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-base-content/50 text-xs">
                  {marks.length} marks
                </span>
                <button onClick={clear} className="btn btn-ghost btn-xs">
                  <FiTrash2 />
                  Clear
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  onClick={() => setSelectedId(swatch.id)}
                  aria-label={`Select ${swatch.name}`}
                  aria-pressed={selectedId === swatch.id}
                  className={`h-8 w-8 rounded-full border transition-transform ${swatch.bgClass} ${
                    selectedId === swatch.id
                      ? 'border-primary ring-primary/30 scale-110 ring-2'
                      : 'border-base-content/20'
                  }`}
                />
              ))}
            </div>

            <div
              aria-label="Drawing area"
              className="bg-base-100 border-base-content/10 grid grid-cols-12 gap-1 rounded-xl border p-3"
              style={{ minHeight: 200 }}>
              {CELLS.map((cell) => {
                const mark = marks.find((m) => m.cell === cell);
                return (
                  <button
                    key={cell}
                    onClick={() => paint(cell)}
                    aria-label={`Cell ${cell + 1}`}
                    className={`h-10 rounded-md transition-colors ${
                      mark
                        ? mark.colorClass
                        : 'bg-base-content/5 hover:bg-base-content/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

WhiteboardTemplate.displayName = 'WhiteboardTemplate';
