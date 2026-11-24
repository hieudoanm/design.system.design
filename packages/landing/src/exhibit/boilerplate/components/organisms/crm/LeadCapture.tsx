'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface Lead {
  name: string;
  email: string;
  company?: string;
}

interface LeadCaptureProps {
  title?: string;
  onCapture?: (lead: Lead) => void;
}

export const LeadCapture: FC<LeadCaptureProps> = ({
  title = 'Capture a lead',
  onCapture,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [captured, setCaptured] = useState(false);

  const submit = () => {
    if (!name.trim() || !email.trim()) return;
    onCapture?.({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
    });
    setCaptured(true);
  };

  return (
    <section className="card bg-base-200 border-base-content/10 rounded-xl border">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {captured ? (
          <p data-testid="lead-captured" className="badge badge-success">
            Lead captured!
          </p>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}>
            <label className="flex flex-col gap-1">
              Name
              <input
                aria-label="Lead name"
                className="input input-bordered input-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              Email
              <input
                type="email"
                aria-label="Lead email"
                className="input input-bordered input-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              Company
              <input
                aria-label="Lead company"
                className="input input-bordered input-sm"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>
            <button
              type="submit"
              data-testid="lead-submit"
              className="btn btn-primary btn-sm mt-2">
              Save lead
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
