'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface Draft {
  id: string;
  to: string;
  subject: string;
}

const DRAFTS: Draft[] = [
  { id: 'd1', to: 'alice@acme.com', subject: 'Re: Q3 planning' },
  { id: 'd2', to: 'bob@acme.com', subject: 'Budget proposal' },
  { id: 'd3', to: 'carol@acme.com', subject: 'Design review notes' },
  { id: 'd4', to: 'dave@acme.com', subject: 'Contract draft' },
];

export const DraftsTemplate: FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>(DRAFTS);

  const deleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
        <p className="text-base-content/50 mt-1 text-sm">Unsent messages.</p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {drafts.length} drafts
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {drafts.length === 0 ? (
              <p className="text-base-content/50 p-5 text-sm">No drafts</p>
            ) : (
              <ul className="divide-base-content/10 flex flex-col divide-y">
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{draft.to}</p>
                      <p className="text-base-content/60 truncate text-xs">
                        {draft.subject}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteDraft(draft.id)}
                      className="btn btn-ghost btn-xs gap-1">
                      <FiTrash2 />
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

DraftsTemplate.displayName = 'DraftsTemplate';
