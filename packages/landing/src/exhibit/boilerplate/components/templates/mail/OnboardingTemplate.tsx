'use client';

import { FC, useState } from 'react';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';
import {
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiUser,
  FiBell,
  FiLayers,
} from 'react-icons/fi';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: <FiUser />,
    title: 'Create your profile',
    description:
      'Tell us about yourself so we can personalize your experience.',
  },
  {
    icon: <FiBell />,
    title: 'Set your preferences',
    description: 'Choose notification settings and language preferences.',
  },
  {
    icon: <FiLayers />,
    title: 'Explore the app',
    description: 'Take a quick tour to discover key features and shortcuts.',
  },
];

export const OnboardingTemplate: FC = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: '', role: '' });
  const [prefs, setPrefs] = useState({ email: true, weekly: false });
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Getting started" />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
          <div className="bg-success/10 flex h-16 w-16 items-center justify-center rounded-full">
            <FiCheck className="text-success h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">All set!</h1>
          <p className="text-base-content/50 text-sm">
            Your profile is ready. Start exploring the app.
          </p>
          <button className="btn btn-primary" onClick={() => {}}>
            Go to dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Getting started" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 p-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-base-300'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-xl text-2xl">
            {STEPS[step].icon}
          </div>
          <h1 className="text-2xl font-bold">{STEPS[step].title}</h1>
          <p className="text-base-content/50 max-w-sm text-sm">
            {STEPS[step].description}
          </p>
        </div>

        {/* Step 0: Profile */}
        {step === 0 && (
          <div className="border-base-content/10 bg-base-200 flex flex-col gap-4 rounded-2xl border p-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Full name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                className="input input-bordered w-full"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Role</label>
              <select
                className="select select-bordered w-full"
                value={profile.role}
                onChange={(e) =>
                  setProfile({ ...profile, role: e.target.value })
                }>
                <option value="">Select a role</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="product">Product Manager</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Preferences */}
        {step === 1 && (
          <div className="border-base-content/10 bg-base-200 flex flex-col gap-4 rounded-2xl border p-6">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-base-content/50 text-xs">
                  Receive updates via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.email}
                onChange={(e) =>
                  setPrefs({ ...prefs, email: e.target.checked })
                }
                className="toggle toggle-primary toggle-sm"
              />
            </label>
            <div className="border-base-content/10 border-t" />
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">Weekly digest</p>
                <p className="text-base-content/50 text-xs">
                  Weekly summary of activity
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.weekly}
                onChange={(e) =>
                  setPrefs({ ...prefs, weekly: e.target.checked })
                }
                className="toggle toggle-primary toggle-sm"
              />
            </label>
          </div>
        )}

        {/* Step 2: Explore */}
        {step === 2 && (
          <div className="border-base-content/10 bg-base-200 flex flex-col gap-3 rounded-2xl border p-6">
            {[
              { label: 'Dashboard', desc: 'View stats and recent activity' },
              { label: 'Settings', desc: 'Customize your experience' },
              { label: 'Store', desc: 'Browse and purchase items' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold">
                  {item.label.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-base-content/50 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`btn btn-ghost btn-sm ${step === 0 ? 'invisible' : ''}`}>
            <FiArrowLeft />
            Back
          </button>
          <span className="text-base-content/40 text-xs">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={() => {
              if (step < STEPS.length - 1) {
                setStep(step + 1);
              } else {
                setDone(true);
              }
            }}
            className="btn btn-primary btn-sm">
            {step < STEPS.length - 1 ? (
              <>
                Next
                <FiArrowRight />
              </>
            ) : (
              'Finish'
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

OnboardingTemplate.displayName = 'OnboardingTemplate';
