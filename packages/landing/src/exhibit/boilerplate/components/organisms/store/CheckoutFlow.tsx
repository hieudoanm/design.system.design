'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface CheckoutFlowProps {
  subtotal?: number;
  onComplete?: () => void;
}

const STEPS = ['Cart', 'Shipping', 'Payment', 'Review'] as const;

type Step = (typeof STEPS)[number];

export const CheckoutFlow: FC<CheckoutFlowProps> = ({
  subtotal = 0,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const goNext = (): void => {
    if (currentStep >= STEPS.length - 1) {
      onComplete?.();
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const goBack = (): void => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  return (
    <section data-testid="checkout-flow" className="flex flex-col gap-6">
      <ul className="steps w-full">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className={`step ${index <= currentStep ? 'step-primary' : ''}`}>
            {step}
          </li>
        ))}
      </ul>

      <div className="card bg-base-200">
        <div className="card-body gap-4">
          {currentStep === 0 && (
            <div>
              <h2 className="text-lg font-medium">Your cart</h2>
              <p className="text-base-content/60 text-sm">
                {subtotal > 0
                  ? `Subtotal $${subtotal.toFixed(2)}`
                  : 'Your cart is empty'}
              </p>
            </div>
          )}
          {currentStep === 1 && (
            <div className="form-control w-full">
              <label className="label" htmlFor="checkout-address">
                Shipping address
              </label>
              <input
                id="checkout-address"
                className="input input-bordered"
                placeholder="Street, city, zip"
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="form-control w-full">
              <label className="label" htmlFor="checkout-card">
                Card number
              </label>
              <input
                id="checkout-card"
                className="input input-bordered"
                placeholder="4242 4242 4242 4242"
              />
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-medium">Review order</h2>
              <p className="text-base-content/60 text-sm">
                Confirm your details and place the order.
              </p>
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={currentStep === 0}
              onClick={goBack}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {currentStep === STEPS.length - 1 ? 'Place order' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
