'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiGift } from 'react-icons/fi';

interface Benefit {
  id: string;
  name: string;
  description: string;
  enrolled: boolean;
}

const BENEFITS: Benefit[] = [
  {
    id: 'b1',
    name: 'Health insurance',
    description: 'Medical, dental, and vision coverage.',
    enrolled: true,
  },
  {
    id: 'b2',
    name: 'Dental',
    description: 'Preventative and restorative dental care.',
    enrolled: false,
  },
  {
    id: 'b3',
    name: '401k match',
    description: 'Company matches up to 4% of contributions.',
    enrolled: true,
  },
  {
    id: 'b4',
    name: 'Gym stipend',
    description: 'Monthly allowance for fitness memberships.',
    enrolled: false,
  },
  {
    id: 'b5',
    name: 'Learning budget',
    description: 'Annual allowance for courses and books.',
    enrolled: true,
  },
  {
    id: 'b6',
    name: 'Remote stipend',
    description: 'Quarterly credit for home office setup.',
    enrolled: false,
  },
];

export const BenefitsTemplate: FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>(BENEFITS);

  const enrolledCount = benefits.filter((benefit) => benefit.enrolled).length;

  const toggle = (id: string) => {
    setBenefits((prev) =>
      prev.map((benefit) =>
        benefit.id === id
          ? { ...benefit, enrolled: !benefit.enrolled }
          : benefit
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Benefits</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Company benefits and perks.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiGift />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Enrollment</p>
              <p className="text-2xl font-bold tracking-tight">
                {enrolledCount} benefits enrolled
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{benefit.name}</h3>
                  {benefit.enrolled && (
                    <span className="badge badge-success badge-sm">
                      Enrolled
                    </span>
                  )}
                </div>
                <p className="text-base-content/50 mb-4 text-sm">
                  {benefit.description}
                </p>
                {benefit.enrolled ? (
                  <button
                    onClick={() => toggle(benefit.id)}
                    className="btn btn-outline btn-sm w-full">
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => toggle(benefit.id)}
                    className="btn btn-primary btn-sm w-full">
                    Enroll
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

BenefitsTemplate.displayName = 'BenefitsTemplate';
