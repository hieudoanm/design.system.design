'use client';

import { type FC, useState } from 'react';
import { FiLock, FiSmartphone } from 'react-icons/fi';

interface LockScreenProps {
  error?: string;
  onUnlock: (password: string) => void | Promise<boolean>;
  biometricEnabled?: boolean;
  onBiometric?: () => void | Promise<boolean>;
}

export const LockScreen: FC<LockScreenProps> = ({
  error,
  onUnlock,
  biometricEnabled = false,
  onBiometric,
}) => {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!password || busy) return;
    setBusy(true);
    await onUnlock(password);
    setBusy(false);
  };

  const handleBiometric = async (): Promise<void> => {
    if (!onBiometric || busy) return;
    setBusy(true);
    await onBiometric();
    setBusy(false);
  };

  return (
    <div className="bg-base-100 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="bg-base-200 card card-body w-full max-w-sm items-center text-center shadow-xl">
        <div className="bg-primary text-primary-content mb-4 flex size-14 items-center justify-center rounded-full">
          <FiLock className="size-7" />
        </div>
        <h1 className="text-xl font-bold">Vault Locked</h1>
        <p className="text-base-content/60 text-sm">
          Enter your master password to continue.
        </p>
        <input
          type="password"
          aria-label="Master password"
          placeholder="Master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSubmit();
          }}
          className="input input-bordered mt-4 w-full"
          autoFocus
        />
        {error && <p className="text-error mt-2 text-sm">{error}</p>}
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!password || busy}
          className="btn btn-primary mt-4 w-full">
          Unlock
        </button>
        {biometricEnabled && onBiometric && (
          <button
            type="button"
            onClick={() => void handleBiometric()}
            disabled={busy}
            className="btn btn-ghost mt-2 w-full">
            <FiSmartphone className="size-4" /> Unlock with biometrics
          </button>
        )}
      </div>
    </div>
  );
};
