'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiActivity,
  FiEdit,
  FiHeart,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

const METRICS = [
  { name: 'BMI', value: '22.7' },
  { name: 'Resting HR', value: '58 bpm' },
  { name: 'VO2 max', value: '46 ml/kg/min' },
];

export const HealthProfileTemplate: FC = () => {
  const [saving, setSaving] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Health Profile</h1>
        <p className="text-base-content/50 mt-1 text-sm">Your health data.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content w-14 rounded-full">
                    <span className="text-lg font-semibold">AN</span>
                  </div>
                </div>
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <FiUsers className="text-primary" /> Profile
                  </h2>
                  <p className="text-lg font-semibold">Alex Nguyen</p>
                  <p className="text-base-content/50 text-xs">
                    Member since 2024
                  </p>
                </div>
              </div>
              {saving ? (
                <span className="badge badge-info">Saving...</span>
              ) : (
                <button
                  onClick={() => setSaving(true)}
                  className="btn btn-primary btn-sm gap-1">
                  <FiEdit />
                  Edit profile
                </button>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <dt className="text-base-content/50 text-xs">Age</dt>
                <dd className="text-sm font-medium">29 years</dd>
              </div>
              <div>
                <dt className="text-base-content/50 text-xs">Height</dt>
                <dd className="text-sm font-medium">178 cm</dd>
              </div>
              <div>
                <dt className="text-base-content/50 text-xs">Weight</dt>
                <dd className="text-sm font-medium">72 kg</dd>
              </div>
              <div>
                <dt className="text-base-content/50 text-xs">Blood type</dt>
                <dd className="text-sm font-medium">O+</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Health Metrics</h2>
          <p className="text-base-content/50 text-sm">3 health metrics</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">BMI</p>
                <FiTrendingUp className="text-primary" />
              </div>
              <p className="text-2xl font-bold">22.7</p>
              <p className="text-base-content/50 text-xs">Healthy range</p>
            </div>
          </div>
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">Resting HR</p>
                <FiHeart className="text-error" />
              </div>
              <p className="text-2xl font-bold">58 bpm</p>
              <p className="text-base-content/50 text-xs">Athlete level</p>
            </div>
          </div>
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">VO2 max</p>
                <FiActivity className="text-success" />
              </div>
              <p className="text-2xl font-bold">46 ml/kg/min</p>
              <p className="text-base-content/50 text-xs">Excellent</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

HealthProfileTemplate.displayName = 'HealthProfileTemplate';
