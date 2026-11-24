'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiUploadCloud,
} from 'react-icons/fi';

interface MappingPreview {
  source: string;
  target: string;
}

const MAPPINGS: MappingPreview[] = [
  { source: 'full_name', target: 'name' },
  { source: 'email_address', target: 'email' },
  { source: 'organization', target: 'company' },
  { source: 'created_at', target: 'createdAt' },
];

const STEP_LABELS = ['Upload file', 'Map columns', 'Done'];

export const ImportTemplate: FC = () => {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState('');

  const reset = () => {
    setStep(1);
    setFileName('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Import data</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Bring your data into the workspace in a few steps.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <ul className="steps steps-sm mb-8 w-full">
          {STEP_LABELS.map((label, idx) => (
            <li
              key={label}
              className={`step ${step >= idx + 1 ? 'step-primary' : ''}`}>
              {label}
            </li>
          ))}
        </ul>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-6">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="border-base-content/20 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center">
                  <FiUploadCloud className="text-base-content/40 h-10 w-10" />
                  <p className="text-base-content/50 text-sm">
                    {fileName || 'Choose a CSV file to get started.'}
                  </p>
                  <label
                    htmlFor="import-file"
                    className="btn btn-primary btn-sm">
                    {fileName ? 'Choose another file' : 'Choose file'}
                  </label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) =>
                      setFileName(e.target.files?.[0]?.name ?? '')
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="btn btn-primary btn-sm">
                    Next
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold">Map columns</h3>
                  <p className="text-base-content/50 mb-4 text-sm">
                    {fileName
                      ? `Mapping columns from ${fileName}.`
                      : 'Mapping columns from your file.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {MAPPINGS.map((mapping) => (
                    <div
                      key={mapping.source}
                      className="bg-base-100 border-base-content/10 flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
                      <span className="font-mono text-xs">
                        {mapping.source}
                      </span>
                      <FiArrowRight className="text-base-content/40 h-4 w-4" />
                      <span className="font-mono text-xs">
                        {mapping.target}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="btn btn-ghost btn-sm">
                    <FiArrowLeft />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="btn btn-primary btn-sm">
                    Next
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="bg-success/10 text-success flex h-14 w-14 items-center justify-center rounded-full">
                  <FiCheck className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold">Import complete</h3>
                <p className="text-base-content/50 text-sm">
                  Your data has been imported successfully.
                </p>
                <button onClick={reset} className="btn btn-ghost btn-sm">
                  Start over
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

ImportTemplate.displayName = 'ImportTemplate';
