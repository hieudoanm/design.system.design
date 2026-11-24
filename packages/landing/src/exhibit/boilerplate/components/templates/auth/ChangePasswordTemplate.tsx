'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onValueChange: (value: string) => void;
  onToggleVisibility: () => void;
}

const PasswordField: FC<PasswordFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  visible,
  onValueChange,
  onToggleVisibility,
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        className="input input-bordered w-full pr-10"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
      <button
        type="button"
        aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
        onClick={onToggleVisibility}
        className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2">
        {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  </div>
);

export const ChangePasswordTemplate: FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Enter your current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSuccess(true);
  };

  const handleContinue = () => {
    setSuccess(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Change Password" backHref="/" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          {success ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-success/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                <FiCheck className="text-success h-6 w-6" />
              </div>
              <h2 className="mt-2">Password updated successfully</h2>
              <p className="text-base-content/50 text-center text-sm">
                Your password has been changed.
              </p>
              <button
                type="button"
                onClick={handleContinue}
                className="btn btn-primary mt-4">
                Continue
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col items-center gap-2">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <FiLock className="text-primary h-6 w-6" />
                </div>
                <h2 className="mt-2">Update password</h2>
                <p className="text-base-content/50 text-sm">
                  Choose a strong password you don&apos;t use elsewhere.
                </p>
              </div>

              {error && (
                <div className="alert alert-error mb-6 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <PasswordField
                  id="current-password"
                  label="Current password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  visible={showCurrent}
                  onValueChange={setCurrentPassword}
                  onToggleVisibility={() => setShowCurrent(!showCurrent)}
                />

                <PasswordField
                  id="new-password"
                  label="New password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  visible={showNew}
                  onValueChange={setNewPassword}
                  onToggleVisibility={() => setShowNew(!showNew)}
                />

                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  visible={showConfirm}
                  onValueChange={setConfirmPassword}
                  onToggleVisibility={() => setShowConfirm(!showConfirm)}
                />

                <button type="submit" className="btn btn-primary mt-2 w-full">
                  Update password
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

ChangePasswordTemplate.displayName = 'ChangePasswordTemplate';
