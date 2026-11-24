'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

const LABELS = ['Work', 'Personal', 'Finance', 'Newsletter'];

export const LabelsTemplate: FC = () => {
  const [labels, setLabels] = useState<string[]>(LABELS);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage('Enter a label name');
      return;
    }
    if (labels.includes(trimmed)) {
      setMessage('Label already exists');
      return;
    }
    setLabels((prev) => [...prev, trimmed]);
    setName('');
    setMessage('Label added');
  };

  const removeLabel = (label: string) => {
    setLabels((prev) => prev.filter((item) => item !== label));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Labels</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Organize your inbox.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-wrap items-center gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Travel"
                aria-label="Label name"
                className="input input-bordered input-sm w-52"
              />
              <button type="submit" className="btn btn-primary btn-sm gap-1">
                <FiPlus />
                Add label
              </button>
            </form>
            {message === 'Enter a label name' && (
              <p className="text-error text-sm" role="alert">
                Enter a label name
              </p>
            )}
            {message === 'Label already exists' && (
              <p className="text-error text-sm" role="alert">
                Label already exists
              </p>
            )}
            {message === 'Label added' && (
              <p className="text-success text-sm">Label added</p>
            )}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center gap-3">
              {labels.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-1 rounded-full">
                  <span className="badge badge-ghost badge-lg">{label}</span>
                  <button
                    onClick={() => removeLabel(label)}
                    aria-label={`Remove ${label}`}
                    className="btn btn-ghost btn-xs">
                    <FiX />
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <p className="text-base-content/50 mt-4 text-sm">
              {labels.length} labels
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

LabelsTemplate.displayName = 'LabelsTemplate';
