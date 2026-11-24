'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiKey, FiLock, FiMonitor, FiShield } from 'react-icons/fi';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';

interface SecurityFeatureProps {
  title: string;
  description: string;
  icon: FC<{ className?: string }>;
  badgeText: string;
  badgeClass: string;
  buttonLabel: string;
  onToggle: () => void;
}

const SecurityFeature: FC<SecurityFeatureProps> = ({
  title,
  description,
  icon: Icon,
  badgeText,
  badgeClass,
  buttonLabel,
  onToggle,
}) => (
  <div className="border-base-content/10 bg-base-200 rounded-xl border p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="bg-base-300 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="text-base-content/40 h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <span className={`badge badge-sm mt-1 ${badgeClass}`}>
            {badgeText}
          </span>
        </div>
      </div>
      <button type="button" onClick={onToggle} className="btn btn-ghost btn-xs">
        {buttonLabel}
      </button>
    </div>
    <p className="text-base-content/50 mt-3 text-xs">{description}</p>
  </div>
);

export const SecurityOverviewTemplate: FC = () => {
  const [passwordSet, setPasswordSet] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [recoveryCodesSet, setRecoveryCodesSet] = useState(true);
  const [sessionsActive, setSessionsActive] = useState(true);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Security" backHref="/" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-6">
          <h2>Security overview</h2>
          <p className="text-base-content/50 mt-1 text-sm">
            Manage the settings that keep your account safe.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SecurityFeature
            title="Password"
            description="Your sign-in password protects your account."
            icon={FiLock}
            badgeText={passwordSet ? 'Set' : 'Not set'}
            badgeClass={passwordSet ? 'badge-success' : 'badge-error'}
            buttonLabel={passwordSet ? 'Remove password' : 'Set password'}
            onToggle={() => setPasswordSet(!passwordSet)}
          />
          <SecurityFeature
            title="Two-factor authentication"
            description="Add an extra layer of security to sign in."
            icon={FiShield}
            badgeText={twoFactorEnabled ? 'Enabled' : 'Not set'}
            badgeClass={twoFactorEnabled ? 'badge-success' : 'badge-error'}
            buttonLabel={twoFactorEnabled ? 'Disable 2FA' : 'Set up'}
            onToggle={() => setTwoFactorEnabled(!twoFactorEnabled)}
          />
          <SecurityFeature
            title="Recovery codes"
            description="Backup codes you can use if you lose access."
            icon={FiKey}
            badgeText={recoveryCodesSet ? 'Set' : 'Not set'}
            badgeClass={recoveryCodesSet ? 'badge-success' : 'badge-error'}
            buttonLabel={recoveryCodesSet ? 'Remove codes' : 'Generate codes'}
            onToggle={() => setRecoveryCodesSet(!recoveryCodesSet)}
          />
          <SecurityFeature
            title="Active sessions"
            description="Devices currently signed in to your account."
            icon={FiMonitor}
            badgeText={sessionsActive ? 'Active' : 'None'}
            badgeClass={sessionsActive ? 'badge-success' : 'badge-error'}
            buttonLabel={sessionsActive ? 'Sign out' : 'Sign in'}
            onToggle={() => setSessionsActive(!sessionsActive)}
          />
        </div>
      </main>
    </div>
  );
};

SecurityOverviewTemplate.displayName = 'SecurityOverviewTemplate';
