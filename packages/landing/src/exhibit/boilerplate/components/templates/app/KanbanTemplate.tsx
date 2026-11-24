'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';

interface Task {
  id: string;
  title: string;
}

interface Column {
  id: string;
  title: string;
}

const COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

const INITIAL_CARDS: Record<string, Task[]> = {
  todo: [
    { id: 't1', title: 'Design landing page' },
    { id: 't2', title: 'Write API docs' },
  ],
  progress: [{ id: 't3', title: 'Build auth flow' }],
  review: [{ id: 't4', title: 'Review checkout PR' }],
  done: [{ id: 't5', title: 'Set up CI pipeline' }],
};

export const KanbanTemplate: FC = () => {
  const [cards, setCards] = useState<Record<string, Task[]>>(INITIAL_CARDS);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const addCard = (colId: string) => {
    const title = drafts[colId]?.trim() || 'Untitled task';
    setCards((prev) => ({
      ...prev,
      [colId]: [...prev[colId], { id: `c${Date.now()}`, title }],
    }));
    setDrafts((prev) => ({ ...prev, [colId]: '' }));
  };

  const deleteCard = (colId: string, cardId: string) => {
    setCards((prev) => ({
      ...prev,
      [colId]: prev[colId].filter((task) => task.id !== cardId),
    }));
  };

  const moveCard = (fromCol: string, cardId: string, dir: number) => {
    const fromIdx = COLUMNS.findIndex((col) => col.id === fromCol);
    const toIdx = fromIdx + dir;
    if (toIdx < 0 || toIdx >= COLUMNS.length) return;
    const toCol = COLUMNS[toIdx].id;
    setCards((prev) => {
      const moving = prev[fromCol].filter((task) => task.id === cardId);
      const remaining = prev[fromCol].filter((task) => task.id !== cardId);
      return {
        ...prev,
        [fromCol]: remaining,
        [toCol]: [...prev[toCol], ...moving],
      };
    });
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Kanban board</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Drag-free board to organise work across columns.
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <section
              key={col.id}
              aria-label={`${col.title} column`}
              className="bg-base-200 border-base-content/10 flex min-h-64 flex-col gap-3 rounded-2xl border p-3">
              <h2 className="text-sm font-semibold tracking-wide">
                {col.title}
              </h2>
              <div className="flex flex-1 flex-col gap-2">
                {cards[col.id].map((task) => (
                  <div
                    key={task.id}
                    className="bg-base-100 border-base-content/10 flex items-center gap-1 rounded-lg border p-2.5">
                    <p className="min-w-0 flex-1 text-sm">{task.title}</p>
                    <button
                      onClick={() => moveCard(col.id, task.id, -1)}
                      aria-label={`Move ${task.title} left`}
                      className="btn btn-ghost btn-xs btn-square">
                      <FiChevronLeft />
                    </button>
                    <button
                      onClick={() => moveCard(col.id, task.id, 1)}
                      aria-label={`Move ${task.title} right`}
                      className="btn btn-ghost btn-xs btn-square">
                      <FiChevronRight />
                    </button>
                    <button
                      onClick={() => deleteCard(col.id, task.id)}
                      aria-label={`Delete ${task.title}`}
                      className="btn btn-ghost btn-xs btn-square hover:text-error">
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={drafts[col.id] ?? ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [col.id]: e.target.value }))
                  }
                  aria-label={`New task for ${col.title}`}
                  placeholder="Add task..."
                  className="input input-bordered input-sm flex-1"
                />
                <button
                  onClick={() => addCard(col.id)}
                  aria-label={`Add to ${col.title}`}
                  className="btn btn-primary btn-sm btn-square">
                  <FiPlus />
                </button>
              </div>
              <p className="text-base-content/40 text-xs">
                {cards[col.id].length} task
                {cards[col.id].length === 1 ? '' : 's'}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

KanbanTemplate.displayName = 'KanbanTemplate';
