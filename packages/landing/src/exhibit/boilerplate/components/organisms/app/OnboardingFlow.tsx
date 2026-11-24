'use client';

import { useState } from 'react';
import type { FC, ReactNode } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  content: ReactNode;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  initialStep?: number;
  onComplete?: (index: number) => void;
}

export const OnboardingFlow: FC<OnboardingFlowProps> = ({
  steps,
  initialStep = 0,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];

  if (!step) return null;

  const next = () => {
    if (isLast) {
      onComplete?.(currentStep);
      return;
    }
    setCurrentStep((value) => value + 1);
  };

  return (
    <section
      data-testid="onboarding-flow"
      className="card bg-base-100 border-base-200 border shadow-sm">
      <div className="card-body">
        <ul className="steps w-full">
          {steps.map((item, index) => (
            <li
              key={item.id}
              className={`step ${index <= currentStep ? 'step-primary' : ''}`}>
              {item.title}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <p className="text-base-content/50 text-sm">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h3 className="card-title mt-1">{step.title}</h3>
          <div className="mt-4">{step.content}</div>
        </div>
        <div className="card-actions mt-6 justify-between">
          <button
            type="button"
            data-testid="onboarding-back"
            className="btn btn-outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}>
            Back
          </button>
          <button
            type="button"
            data-testid="onboarding-next"
            className="btn btn-primary"
            onClick={next}>
            {isLast ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </section>
  );
};
