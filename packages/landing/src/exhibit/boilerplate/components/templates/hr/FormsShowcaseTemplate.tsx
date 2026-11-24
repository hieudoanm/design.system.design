'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiRotateCcw, FiSend } from 'react-icons/fi';
import { TextField } from '@/exhibit/boilerplate/components/atoms/auth/TextField';

const PLANS = ['Free', 'Pro', 'Enterprise'];
const INTERESTS = ['Design', 'Development', 'Marketing'];

export const FormsShowcaseTemplate: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Free');
  const [interests, setInterests] = useState<string[]>([]);
  const [accountType, setAccountType] = useState('Personal');
  const [budget, setBudget] = useState(500);
  const [notifications, setNotifications] = useState(true);
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const interestsText = interests.length > 0 ? interests.join(', ') : 'none';
    const notificationsText = notifications ? 'on' : 'off';
    setSummary(
      `Submitted: name: ${name}, email: ${email}, plan: ${plan}, interests: ${interestsText}, budget: ${budget}, notifications: ${notificationsText}`
    );
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Forms
          </p>
          <h1>Forms showcase</h1>
          <p className="text-base-content/50 text-sm">
            A playground of common form controls.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-base-content/10 bg-base-200 grid grid-cols-1 gap-5 rounded-2xl border p-6 md:grid-cols-2">
          <TextField
            label="Name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Plan</span>
            <select
              className="select select-bordered"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}>
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Interests</legend>
            {INTERESTS.map((interest) => (
              <label
                key={interest}
                className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={interests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                />
                <span className="text-sm">{interest}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Account type</legend>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="accountType"
                className="radio radio-sm"
                checked={accountType === 'Personal'}
                onChange={() => setAccountType('Personal')}
              />
              <span className="text-sm">Personal</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="accountType"
                className="radio radio-sm"
                checked={accountType === 'Business'}
                onChange={() => setAccountType('Business')}
              />
              <span className="text-sm">Business</span>
            </label>
          </fieldset>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Budget: ${budget}</span>
            <input
              type="range"
              min={0}
              max={1000}
              step={50}
              aria-label="Budget"
              className="range range-sm"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg p-2">
            <span className="text-sm font-medium">Notifications</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="btn btn-primary gap-2">
              <FiSend className="h-4 w-4" />
              Submit
            </button>
            <button
              type="button"
              onClick={() => setSummary(null)}
              className="btn btn-ghost gap-2">
              <FiRotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </form>

        {summary && (
          <div className="alert alert-success gap-2">
            <FiCheckCircle className="h-5 w-5" />
            <span>{summary}</span>
          </div>
        )}
      </main>
    </div>
  );
};

FormsShowcaseTemplate.displayName = 'FormsShowcaseTemplate';
