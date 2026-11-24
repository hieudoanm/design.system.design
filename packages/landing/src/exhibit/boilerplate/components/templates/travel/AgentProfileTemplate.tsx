'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiAward,
  FiCheckCircle,
  FiHome,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiStar,
  FiUser,
} from 'react-icons/fi';

const AGENT = {
  name: 'Sarah Mitchell',
  title: 'Senior Real Estate Advisor',
  rating: '4.9',
  listings: 42,
  phone: '(555) 123-4567',
  email: 'sarah@estateagents.com',
};

const CREDENTIALS = [
  'Licensed Realtor',
  'Top 1% Producer',
  'Certified Negotiation Expert',
  '12 Years Experience',
];

export const AgentProfileTemplate: FC = () => {
  const [contacted, setContacted] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Agent Profile</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Meet your local expert.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body gap-4 p-6 sm:flex-row sm:items-center">
            <div className="bg-base-300/60 flex h-24 w-24 shrink-0 items-center justify-center rounded-full">
              <FiUser className="text-base-content/40 h-10 w-10" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-medium">{AGENT.name}</p>
                  <p className="text-base-content/50 text-xs">{AGENT.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {contacted && (
                    <span className="badge badge-success badge-sm">
                      Message sent
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setContacted((prev) => !prev)}
                    className="btn btn-primary btn-sm gap-1">
                    <FiMessageCircle />
                    Contact agent
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiStar className="h-3 w-3" />
                  {AGENT.rating} rating
                </p>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiHome className="h-3 w-3" />
                  {AGENT.listings} active listings
                </p>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiPhone className="h-3 w-3" />
                  {AGENT.phone}
                </p>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiMail className="h-3 w-3" />
                  {AGENT.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="stats stats-vertical sm:stats-horizontal w-full">
          <div className="stat">
            <p className="stat-title">Active listings</p>
            <p className="stat-value text-xl">{AGENT.listings}</p>
          </div>
          <div className="stat">
            <p className="stat-title">Sold this year</p>
            <p className="stat-value text-xl">23</p>
          </div>
          <div className="stat">
            <p className="stat-title">Avg. days to close</p>
            <p className="stat-value text-xl">18</p>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-6 border">
          <div className="card-body p-5">
            <h2 className="card-title flex items-center gap-2 text-base">
              <FiAward className="text-primary h-4 w-4" />
              Credentials &amp; Badges
            </h2>
            <ul className="flex flex-col gap-2">
              {CREDENTIALS.map((credential) => (
                <li
                  key={credential}
                  className="flex items-center gap-2 text-sm">
                  <FiCheckCircle className="text-base-content/50 h-4 w-4 shrink-0" />
                  {credential}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

AgentProfileTemplate.displayName = 'AgentProfileTemplate';
