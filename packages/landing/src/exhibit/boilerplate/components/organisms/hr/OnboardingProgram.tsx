'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

interface OnboardingProgramProps {
  steps: OnboardingStep[];
  startIndex?: number;
}

export const OnboardingProgram: FC<OnboardingProgramProps> = ({
  steps,
  startIndex = 0,
}) => {
  const [current, setCurrent] = useState(startIndex);
  const step = steps[current];

  const goTo = (index: number): void => {
    setCurrent(Math.max(0, Math.min(steps.length - 1, index)));
  };

  return (
    <div
      className="flex w-full flex-col gap-4"
      data-testid="onboarding-program">
      <div className="w-full">
        <progress
          className="progress progress-primary w-full"
          value={steps.length > 0 ? current + 1 : 0}
          max={steps.length}
        />
        <div className="mt-3 flex flex-col gap-1">
          {steps.map((item, index) => {
            const done = index < current;
            const active = index === current;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={`hover:bg-base-200 flex items-center gap-3 rounded-lg px-3 py-2 text-left ${
                  active ? 'bg-base-200' : ''
                }`}>
                <span
                  className={`badge ${done ? 'badge-success' : 'badge-ghost'}`}>
                  {done ? '✓' : index + 1}
                </span>
                <span
                  className={`text-sm ${active ? 'font-medium' : 'text-base-content/60'}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="card bg-base-200 border-base-content/10 border">
        <div className="card-body">
          {step ? (
            <>
              <h3 className="card-title">
                Step {current + 1} of {steps.length}
              </h3>
              <h4 className="text-base font-medium">{step.title}</h4>
              <p className="text-base-content/60 text-sm">{step.description}</p>
            </>
          ) : (
            <p className="text-base-content/40 text-sm">No onboarding steps</p>
          )}
          <div className="mt-2 flex justify-between">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => goTo(current - 1)}
              className="btn btn-ghost btn-sm">
              Back
            </button>
            <button
              type="button"
              disabled={current >= steps.length - 1}
              onClick={() => goTo(current + 1)}
              className="btn btn-primary btn-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OnboardingProgram.displayName = 'OnboardingProgram';
