'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiEye, FiEyeOff, FiKey, FiRefreshCw } from 'react-icons/fi';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';

const initialCodes: string[] = [
  '7F2K-9QXP-L4MN',
  'A3RD-B8PV-X2QK',
  'K9JT-M6NC-H5GW',
  'Q2WB-V4XS-C7DP',
  'L8ZF-P3RT-N6YK',
  'B4HC-J7XD-M9QS',
  'X5KV-N2FG-W8RL',
  'P6TM-D3ZS-J4NH',
];

const regeneratedSuffixes: string[] = [
  'F2K4-M7QT',
  'QX9P-L3RD',
  'BV8N-W6TC',
  'MJ2H-Z5XD',
  'PL7K-N4QF',
  'GR8X-C2VY',
  'YT5B-H3NJ',
  'WD9Q-S6KM',
];

const maskedCode =
  '\u2022\u2022\u2022\u2022-\u2022\u2022\u2022\u2022-\u2022\u2022\u2022\u2022';

const generateCodes = (): string[] =>
  Array.from(
    { length: 8 },
    (_, index) =>
      `RN${String(index + 1).padStart(2, '0')}-${regeneratedSuffixes[index]}`
  );

export const RecoveryCodesTemplate: FC = () => {
  const [codes, setCodes] = useState(initialCodes);
  const [revealed, setRevealed] = useState(false);
  const [regenerated, setRegenerated] = useState(false);

  const toggleReveal = () => setRevealed((prev) => !prev);

  const regenerate = () => {
    setCodes(generateCodes());
    setRevealed(true);
    setRegenerated(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Recovery Codes" backHref="/" />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
              <FiKey className="text-primary h-6 w-6" />
            </div>
            <h2>Recovery codes</h2>
            <p className="text-base-content/50 text-sm">
              Each code can be used once to sign in. Store them somewhere safe.
            </p>
          </div>

          {regenerated && (
            <div className="alert alert-success mb-6 text-sm">
              <FiCheck size={16} />
              Codes regenerated
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {codes.map((code) => (
              <code
                key={code}
                className="border-base-content/10 bg-base-300 rounded-lg px-2 py-3 text-center text-xs">
                {revealed ? code : maskedCode}
              </code>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={toggleReveal}
              className="btn btn-outline btn-sm flex-1 gap-1">
              {revealed ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              {revealed ? 'Hide codes' : 'Reveal codes'}
            </button>
            <button
              type="button"
              onClick={regenerate}
              className="btn btn-primary btn-sm flex-1 gap-1">
              <FiRefreshCw size={16} />
              Regenerate codes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

RecoveryCodesTemplate.displayName = 'RecoveryCodesTemplate';
