'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const SUBJECTS = ['General', 'Billing', 'Support', 'Press'];

const CONTACT_BLOCKS = [
  { icon: <FiMail />, label: 'Email', value: 'hello@boilerplate.com' },
  { icon: <FiPhone />, label: 'Phone', value: '+1 555-0132' },
  {
    icon: <FiMapPin />,
    label: 'Address',
    value: '1 Market Street, San Francisco',
  },
];

export const ContactTemplate: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setSent(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/auth/sign-in" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="btn btn-primary btn-sm">
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-24">
        <span className="badge badge-neutral mb-6 rounded-full">Contact</span>
        <h1 className="mb-10 text-4xl md:text-5xl">Get in touch</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="flex flex-col gap-4 md:col-span-2">
            {CONTACT_BLOCKS.map((block) => (
              <div
                key={block.label}
                className="border-base-content/10 bg-base-200 flex items-center gap-3 rounded-2xl border p-4">
                <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  {block.icon}
                </span>
                <div>
                  <p className="text-base-content/50 text-xs">{block.label}</p>
                  <p className="text-sm font-medium">{block.value}</p>
                </div>
              </div>
            ))}

            <details className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
              <summary className="text-sm font-medium">FAQ</summary>
              <p className="text-base-content/50 mt-3 text-sm">
                Check the help center for common questions about billing,
                refunds, and account access.
              </p>
            </details>
          </div>

          <div className="card border-base-content/10 bg-base-200 border md:col-span-3">
            <div className="card-body flex flex-col gap-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="input input-bordered"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="input input-bordered"
                />
              </div>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                aria-label="Subject"
                className="select select-bordered">
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                aria-label="Message"
                className="textarea textarea-bordered min-h-32"
              />
              {error && (
                <p className="text-error text-sm" role="alert">
                  {error}
                </p>
              )}
              {sent ? (
                <p className="bg-success/10 text-success rounded-xl px-4 py-3 text-sm">
                  Message sent
                </p>
              ) : (
                <button onClick={handleSubmit} className="btn btn-primary">
                  Send message
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/landing/privacy"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Privacy
            </Link>
            <Link
              href="/landing/terms"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Terms
            </Link>
            <Link
              href="/landing/contact"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

ContactTemplate.displayName = 'ContactTemplate';
