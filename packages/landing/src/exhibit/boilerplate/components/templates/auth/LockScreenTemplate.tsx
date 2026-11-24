'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Avatar } from '@/exhibit/boilerplate/components/atoms/developer/Avatar';

export const LockScreenTemplate: FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password required');
      return;
    }
    if (password !== 'demo') {
      setError('Incorrect password');
      return;
    }
    setError(null);
    setUnlocked(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          {unlocked ? (
            <div className="flex flex-col items-center gap-4">
              <Avatar alt="Demo User" size="lg" />
              <h2 className="mt-2">Welcome back, Demo User</h2>
              <span className="badge badge-success">Unlock complete</span>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col items-center gap-2">
                <Avatar alt="Demo User" size="lg" />
                <h2 className="mt-2">Screen locked</h2>
                <p className="text-base-content/50 text-sm">
                  Enter your password to unlock
                </p>
              </div>

              {error && (
                <div className="alert alert-error mb-6 text-sm">{error}</div>
              )}

              <form onSubmit={handleUnlock} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="lock-password"
                    className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="lock-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="input input-bordered w-full pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2">
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Unlock
                </button>
              </form>

              <a
                href="/auth/sign-in"
                className="text-base-content/50 mt-6 block text-center text-sm hover:underline">
                Sign in as a different user
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

LockScreenTemplate.displayName = 'LockScreenTemplate';
