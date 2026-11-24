'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from '@/exhibit/boilerplate/link';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';
import { TextField } from '@/exhibit/boilerplate/components/atoms/auth/TextField';
import { Spinner } from '@/exhibit/boilerplate/components/atoms/support/Spinner';

interface SignInTemplateProps {
  onSubmit: (data: { email: string; password: string }) => void | Promise<void>;
  error?: string;
  loading?: boolean;
}

export const SignInTemplate: FC<SignInTemplateProps> = ({
  onSubmit,
  error,
  loading = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Sign In" backHref="/" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
              <FiLock className="text-primary h-6 w-6" />
            </div>
            <h2 className="mt-2">Welcome back</h2>
            <p className="text-base-content/50 text-sm">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-6 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" className="checkbox checkbox-sm" />
                <span className="text-base-content/60 text-sm">
                  Remember me
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-primary text-sm hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-2 w-full"
              disabled={loading}>
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-base-content/50 mt-8 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
};

SignInTemplate.displayName = 'SignInTemplate';
