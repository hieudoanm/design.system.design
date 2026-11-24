'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '../../atoms/support/Button';
import { PasswordField } from '../../atoms/auth/PasswordField';
import { TextField } from '../../atoms/auth/TextField';

interface AuthPayload {
  name?: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  mode?: 'login' | 'signup';
  title?: string;
  onSubmit: (payload: AuthPayload) => void;
  loading?: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthForm: FC<AuthFormProps> = ({
  mode = 'login',
  title,
  onSubmit,
  loading = false,
  error,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>(
    undefined
  );

  const submit = () => {
    if (mode === 'signup' && name.trim() === '') {
      setValidationError('Please fill in all fields.');
      return;
    }
    if (!EMAIL_PATTERN.test(email) || password.length < 6) {
      setValidationError(
        'Enter a valid email and a password of at least 6 characters.'
      );
      return;
    }
    setValidationError(undefined);
    onSubmit({
      name: mode === 'signup' ? name.trim() : undefined,
      email,
      password,
    });
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">
          {title ?? (mode === 'login' ? 'Sign in' : 'Create account')}
        </h2>
        <p className="text-base-content/50 text-sm">
          {mode === 'login' ? 'Welcome back.' : 'Start your free trial.'}
        </p>
      </div>
      {mode === 'signup' && (
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
        />
      )}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@x.com"
        autoComplete="email"
      />
      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      {(validationError ?? error) && (
        <span className="text-error text-xs">{validationError ?? error}</span>
      )}
      <Button type="submit" loading={loading} className="w-full">
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  );
};
