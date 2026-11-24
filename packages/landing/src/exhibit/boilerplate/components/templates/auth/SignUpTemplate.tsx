'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from '@/exhibit/boilerplate/link';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';
import { TextField } from '@/exhibit/boilerplate/components/atoms/auth/TextField';
import { Spinner } from '@/exhibit/boilerplate/components/atoms/support/Spinner';

interface SignUpTemplateProps {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
  }) => void | Promise<void>;
  error?: string;
  loading?: boolean;
}

export const SignUpTemplate: FC<SignUpTemplateProps> = ({
  onSubmit,
  error,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters');
      return;
    }

    onSubmit({ name, email, password });
  };

  const displayError = fieldError ?? error;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Sign Up" backHref="/" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
              <FiUserPlus className="text-primary h-6 w-6" />
            </div>
            <h2 className="mt-2">Create account</h2>
            <p className="text-base-content/50 text-sm">
              Get started with a free account
            </p>
          </div>

          {displayError && (
            <div className="alert alert-error mb-6 text-sm">{displayError}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField
              label="Full name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
                  placeholder="At least 8 characters"
                  className="input input-bordered w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <TextField
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm mt-0.5"
                required
              />
              <span className="text-base-content/60 text-sm">
                I agree to the{' '}
                <Link href="/" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              className="btn btn-primary mt-2 w-full"
              disabled={loading}>
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-base-content/50 mt-8 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
};

SignUpTemplate.displayName = 'SignUpTemplate';
