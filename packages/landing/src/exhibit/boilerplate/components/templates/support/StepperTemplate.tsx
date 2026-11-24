'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Step {
  id: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Account',
    description: 'Create your account details.',
  },
  {
    id: 2,
    title: 'Profile',
    description: 'Add your profile information.',
  },
  {
    id: 3,
    title: 'Preferences',
    description: 'Configure your preferences.',
  },
  {
    id: 4,
    title: 'Done',
    description: 'All steps complete. You are ready to go.',
  },
];

const TOTAL_STEPS = STEPS.length;

export const StepperTemplate: FC = () => {
  const [step, setStep] = useState(1);

  const next = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const back = () => setStep((prev) => Math.max(prev - 1, 1));

  const active = STEPS.find((s) => s.id === step) ?? STEPS[0];

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Stepper
          </p>
          <h1>Stepper</h1>
          <p className="text-base-content/50 text-sm">
            A four-step wizard with progress indicator.
          </p>
        </div>

        <ul className="steps w-full">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={`step ${s.id <= step ? 'step-primary' : ''}`}>
              {s.title}
            </li>
          ))}
        </ul>

        <div className="card border-base-content/10 bg-base-200 border">
          <div className="card-body p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3>
                  Step {active.id}: {active.title}
                </h3>
                <p className="text-base-content/60 text-sm">
                  {active.description}
                </p>
              </div>
              {step === TOTAL_STEPS && (
                <span className="badge badge-success badge-sm gap-1">
                  <FiCheck className="h-3 w-3" />
                  All steps complete
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step <= 1}
            className="btn btn-ghost btn-sm gap-1">
            <FiChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={step >= TOTAL_STEPS}
            className="btn btn-primary btn-sm gap-1">
            Next
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

StepperTemplate.displayName = 'StepperTemplate';
