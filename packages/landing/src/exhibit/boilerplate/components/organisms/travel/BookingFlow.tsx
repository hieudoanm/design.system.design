'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface BookingFlowProps {
  onComplete?: () => void;
}

const STEPS = [
  'Search',
  'Select',
  'Passenger',
  'Payment',
  'Confirmed',
] as const;

type Step = (typeof STEPS)[number];

const STEP_CONTENT: Record<Step, { title: string; hint: string }> = {
  Search: { title: 'Search flights', hint: 'Pick a route and date.' },
  Select: { title: 'Select a flight', hint: 'Choose the best option.' },
  Passenger: {
    title: 'Passenger details',
    hint: 'Enter traveler information.',
  },
  Payment: { title: 'Payment', hint: 'Securely confirm your booking.' },
  Confirmed: {
    title: 'Booking confirmed',
    hint: 'Check your email for details.',
  },
};

export const BookingFlow: FC<BookingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const goNext = (): void => {
    if (isLast) {
      onComplete?.();
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <section data-testid="booking-flow" className="flex flex-col gap-6">
      <ul className="steps w-full">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`step ${index <= currentStep ? 'step-primary' : ''}`}>
            {label}
          </li>
        ))}
      </ul>

      <div className="card bg-base-200">
        <div className="card-body gap-4">
          <h2 className="text-lg font-medium">{STEP_CONTENT[step].title}</h2>
          <p className="text-base-content/60 text-sm">
            {STEP_CONTENT[step].hint}
          </p>
          {currentStep === 2 && (
            <div className="form-control w-full">
              <label className="label" htmlFor="booking-name">
                Full name
              </label>
              <input
                id="booking-name"
                className="input input-bordered"
                placeholder="Jane Doe"
              />
            </div>
          )}
          {isLast && (
            <div className="alert alert-success">
              <span>Your trip is booked. Enjoy your journey!</span>
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {isLast ? 'Done' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
