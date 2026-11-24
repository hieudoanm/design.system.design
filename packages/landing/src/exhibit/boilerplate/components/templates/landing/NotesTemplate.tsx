'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiEdit2,
  FiFileText,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

interface Note {
  id: string;
  title: string;
  body: string;
  date: string;
}

const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Launch checklist',
    body: 'Verify auth flows and payments before shipping.',
    date: 'Aug 04',
  },
  {
    id: 'n2',
    title: 'Ideas',
    body: 'Dark mode, keyboard shortcuts, offline cache.',
    date: 'Jul 30',
  },
  {
    id: 'n3',
    title: 'Meeting notes',
    body: 'Ship v2 by the end of the quarter.',
    date: 'Jul 22',
  },
];

export const NotesTemplate: FC = () => {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const query = search.trim().toLowerCase();
  const filtered = notes.filter((note) =>
    `${note.title} ${note.body}`.toLowerCase().includes(query)
  );

  const addNote = () => {
    setNotes((prev) => [
      {
        id: `n${Date.now()}`,
        title: 'Untitled note',
        body: 'Start writing...',
        date: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
  };

  const saveEdit = (id: string) => {
    const title = editTitle.trim() || 'Untitled note';
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, title, body: editBody } : note
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Capture ideas and keep them organised.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="input input-bordered input-sm bg-base-200 w-full pl-9"
            />
          </div>
          <button onClick={addNote} className="btn btn-primary btn-sm w-fit">
            <FiPlus />
            New note
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10">
            <FiFileText className="text-base-content/30 h-8 w-8" />
            <p className="text-base-content/50 text-sm">No notes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((note) => (
              <div
                key={note.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  {editingId === note.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        aria-label="Note title"
                        className="input input-bordered input-sm"
                      />
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        aria-label="Note body"
                        rows={3}
                        className="textarea textarea-bordered textarea-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(note.id)}
                          aria-label="Save note"
                          className="btn btn-primary btn-xs">
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          aria-label="Cancel edit"
                          className="btn btn-ghost btn-xs">
                          <FiX />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{note.title}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(note)}
                            aria-label={`Edit ${note.title}`}
                            className="btn btn-ghost btn-xs btn-square">
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            aria-label={`Delete ${note.title}`}
                            className="btn btn-ghost btn-xs btn-square hover:text-error">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <p className="text-base-content/60 text-sm">
                        {note.body}
                      </p>
                      <p className="text-base-content/40 text-xs">
                        {note.date}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

NotesTemplate.displayName = 'NotesTemplate';
