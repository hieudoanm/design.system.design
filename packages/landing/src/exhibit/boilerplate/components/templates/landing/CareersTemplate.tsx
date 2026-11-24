'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiMapPin, FiCheck } from 'react-icons/fi';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
}

interface Department {
  name: string;
  jobs: Job[];
}

const DEPARTMENTS: Department[] = [
  {
    name: 'Engineering',
    jobs: [
      {
        id: 'eng-1',
        title: 'Senior Frontend Engineer',
        location: 'Remote',
        type: 'Full-time',
      },
      {
        id: 'eng-2',
        title: 'Backend Engineer',
        location: 'San Francisco',
        type: 'Full-time',
      },
      {
        id: 'eng-3',
        title: 'Platform Engineer',
        location: 'Remote',
        type: 'Full-time',
      },
    ],
  },
  {
    name: 'Product & Design',
    jobs: [
      {
        id: 'pd-1',
        title: 'Product Designer',
        location: 'Remote',
        type: 'Contract',
      },
      {
        id: 'pd-2',
        title: 'Product Manager',
        location: 'San Francisco',
        type: 'Full-time',
      },
    ],
  },
  {
    name: 'Marketing',
    jobs: [
      {
        id: 'mk-1',
        title: 'Content Marketer',
        location: 'Remote',
        type: 'Full-time',
      },
    ],
  },
];

export const CareersTemplate: FC = () => {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const allJobs = DEPARTMENTS.flatMap((department) => department.jobs);
  const openCount = allJobs.length - appliedIds.length;

  const apply = (id: string) =>
    setAppliedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-24">
        <span className="badge badge-neutral mb-6 rounded-full">Careers</span>
        <h1 className="mb-4 text-4xl md:text-5xl">Work with us</h1>
        <p className="text-base-content/60 mb-12 text-sm">
          {openCount} open positions across the team.
        </p>

        <div className="flex flex-col gap-10">
          {DEPARTMENTS.map((department) => (
            <section key={department.name}>
              <h2 className="text-base-content mb-4 text-xl">
                {department.name}
              </h2>
              <div className="flex flex-col gap-3">
                {department.jobs.map((job) => {
                  const applied = appliedIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      className="border-base-content/10 bg-base-200 flex items-center justify-between gap-4 rounded-2xl border p-5">
                      <div>
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-base-content/50 mt-1 flex items-center gap-1 text-xs">
                          <FiMapPin className="h-3 w-3" />
                          {job.location} · {job.type}
                        </p>
                      </div>
                      {applied ? (
                        <span className="badge badge-success badge-sm gap-1">
                          <FiCheck className="h-3 w-3" />
                          Application sent
                        </span>
                      ) : (
                        <button
                          onClick={() => apply(job.id)}
                          className="btn btn-primary btn-sm">
                          Apply
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
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

CareersTemplate.displayName = 'CareersTemplate';
