'use client';

import { type FC, useState } from 'react';
import { FaLock } from 'react-icons/fa';

interface PinLockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
  onSetup?: (pin: string) => Promise<void>;
  isSetup?: boolean;
}

export const PinLockScreen: FC<PinLockScreenProps> = ({
  onUnlock,
  onSetup,
  isSetup = false,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enter' | 'confirm'>(
    isSetup ? 'enter' : 'enter'
  );

  const handleSubmit = async (): Promise<void> => {
    setError('');
    if (step === 'confirm') {
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      setLoading(true);
      await onSetup?.(pin);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ok = await onUnlock(pin);
    setLoading(false);
    if (!ok) {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') void handleSubmit();
  };

  return (
    <div className="bg-base-200/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-base-100 border-base-300 mx-4 w-full max-w-sm rounded-2xl border p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-primary/10 mb-3 flex h-16 w-16 items-center justify-center rounded-full">
            <FaLock className="text-primary h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">
            {isSetup
              ? 'Set Up PIN'
              : step === 'confirm'
                ? 'Confirm PIN'
                : 'Enter PIN'}
          </h2>
          <p className="text-base-content/50 mt-1 text-sm">
            {isSetup
              ? 'Create a 4-6 digit PIN to lock your app'
              : step === 'confirm'
                ? 'Re-enter your PIN to confirm'
                : 'Enter your PIN to unlock'}
          </p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={step === 'confirm' ? confirmPin : pin}
            onChange={(e) =>
              step === 'confirm'
                ? setConfirmPin(e.target.value)
                : setPin(e.target.value)
            }
            onKeyDown={handleKeyPress}
            placeholder="••••"
            className="input input-bordered w-full text-center text-2xl tracking-[0.5em]"
            autoFocus
          />
          {error && <p className="text-error text-center text-sm">{error}</p>}
          <button
            type="button"
            onClick={() => {
              if (isSetup && step === 'enter') {
                setStep('confirm');
                setError('');
              } else {
                void handleSubmit();
              }
            }}
            disabled={
              loading ||
              (step === 'enter' && pin.length < 4) ||
              (step === 'confirm' && confirmPin.length < 4)
            }
            className="btn btn-primary w-full">
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : isSetup && step === 'enter' ? (
              'Next'
            ) : (
              'Unlock'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
