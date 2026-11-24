'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiPlayCircle,
  FiTarget,
} from 'react-icons/fi';

type Period = 'This week' | 'This month' | 'This year';

interface PeriodStats {
  studyTime: string;
  coursesCompleted: number;
  lessonsCompleted: number;
  quizAverage: number;
}

interface PeriodReport {
  period: Period;
  label: string;
  stats: PeriodStats;
}

const REPORTS: PeriodReport[] = [
  {
    period: 'This week',
    label: 'This week report',
    stats: {
      studyTime: '8h 30m',
      coursesCompleted: 3,
      lessonsCompleted: 12,
      quizAverage: 86,
    },
  },
  {
    period: 'This month',
    label: 'This month report',
    stats: {
      studyTime: '30h 45m',
      coursesCompleted: 5,
      lessonsCompleted: 48,
      quizAverage: 89,
    },
  },
  {
    period: 'This year',
    label: 'This year report',
    stats: {
      studyTime: '180h 20m',
      coursesCompleted: 8,
      lessonsCompleted: 156,
      quizAverage: 92,
    },
  },
];

const getReport = (period: Period): PeriodReport =>
  REPORTS.find((report) => report.period === period) ?? REPORTS[0];

type StatIcon = 'clock' | 'check' | 'play' | 'target';

interface StatCard {
  label: string;
  value: string;
  icon: StatIcon;
}

const buildStats = (report: PeriodReport): StatCard[] => [
  { label: 'Study time', value: report.stats.studyTime, icon: 'clock' },
  {
    label: 'Courses completed',
    value: String(report.stats.coursesCompleted),
    icon: 'check',
  },
  {
    label: 'Lessons completed',
    value: String(report.stats.lessonsCompleted),
    icon: 'play',
  },
  {
    label: 'Quiz average',
    value: `${report.stats.quizAverage}%`,
    icon: 'target',
  },
];

export const LearningAnalyticsTemplate: FC = () => {
  const [period, setPeriod] = useState<Period>('This week');

  const report = getReport(period);

  const stats = buildStats(report);

  const renderIcon = (icon: StatIcon) => {
    if (icon === 'clock') {
      return <FiClock />;
    }
    if (icon === 'check') {
      return <FiCheckCircle />;
    }
    if (icon === 'play') {
      return <FiPlayCircle />;
    }
    return <FiTarget />;
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          Learning Analytics
        </h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Your progress at a glance.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiBarChart2 />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Period</p>
              <p className="text-2xl font-bold tracking-tight">{period}</p>
            </div>
          </div>
        </div>

        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {REPORTS.map((reportItem) => (
            <button
              key={reportItem.period}
              onClick={() => setPeriod(reportItem.period)}
              className={`tab ${
                period === reportItem.period ? 'tab-active' : ''
              }`}>
              {reportItem.period}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex-row items-center gap-4 p-5">
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg">
                  {renderIcon(stat.icon)}
                </div>
                <div>
                  <p className="text-base-content/50 text-xs">{stat.label}</p>
                  <p className="text-xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-base-content/50 mt-6 text-center text-sm underline">
          {report.label}
        </p>
      </main>
    </div>
  );
};

LearningAnalyticsTemplate.displayName = 'LearningAnalyticsTemplate';
