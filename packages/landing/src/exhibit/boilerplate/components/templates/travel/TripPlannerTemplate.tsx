'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';

interface Activity {
  id: string;
  time: string;
  name: string;
  location: string;
}

interface TripDay {
  id: string;
  label: string;
  activities: Activity[];
}

const INITIAL_DAYS: TripDay[] = [
  {
    id: 'day1',
    label: 'Day 1',
    activities: [
      {
        id: 'a1',
        time: '09:00',
        name: 'Ho Chi Minh Mausoleum',
        location: 'Ba Dinh',
      },
      {
        id: 'a2',
        time: '12:30',
        name: 'Pho Street Lunch',
        location: 'Old Quarter',
      },
      {
        id: 'a3',
        time: '15:00',
        name: 'Water Puppet Show',
        location: 'Hoan Kiem Lake',
      },
    ],
  },
  {
    id: 'day2',
    label: 'Day 2',
    activities: [
      {
        id: 'b1',
        time: '08:00',
        name: 'Ha Long Bay Cruise',
        location: 'Ha Long Bay',
      },
      {
        id: 'b2',
        time: '18:30',
        name: 'Night Market Dinner',
        location: 'Tuan Chau',
      },
    ],
  },
  {
    id: 'day3',
    label: 'Day 3',
    activities: [
      { id: 'c1', time: '09:30', name: 'Imperial City Tour', location: 'Hue' },
    ],
  },
];

export const TripPlannerTemplate: FC = () => {
  const [days, setDays] = useState<TripDay[]>(INITIAL_DAYS);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeDay = days[activeIndex];

  const addActivity = () => {
    const activity: Activity = {
      id: `activity-${Date.now()}`,
      time: '18:00',
      name: 'New activity',
      location: 'City center',
    };
    setDays((prev) =>
      prev.map((day, index) =>
        index === activeIndex
          ? { ...day, activities: [...day.activities, activity] }
          : day
      )
    );
  };

  const removeActivity = (activityId: string) => {
    setDays((prev) =>
      prev.map((day, index) =>
        index === activeIndex
          ? {
              ...day,
              activities: day.activities.filter(
                (activity) => activity.id !== activityId
              ),
            }
          : day
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Trip Planner</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Plan your itinerary.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {days.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setActiveIndex(index)}
                className={`tab ${activeIndex === index ? 'tab-active' : ''}`}>
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">{days.length} days</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 mb-4 border">
          <div className="card-body gap-3 p-5">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-base-content/30 h-4 w-4" />
              <p className="text-sm font-medium">{activeDay.label}</p>
              <p className="text-base-content/50 text-xs">
                {activeDay.activities.length} activities
              </p>
            </div>
            <button
              type="button"
              onClick={addActivity}
              className="btn btn-primary btn-sm w-fit gap-1">
              <FiPlus />
              Add activity
            </button>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {activeDay.activities.map((activity) => (
              <div
                key={activity.id}
                className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                <span className="text-base-content/50 w-12 text-xs font-medium">
                  {activity.time}
                </span>
                <FiClock className="text-base-content/30 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{activity.name}</p>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiMapPin className="h-3 w-3" />
                    {activity.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeActivity(activity.id)}
                  className="btn btn-ghost btn-xs gap-1">
                  <FiTrash2 />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

TripPlannerTemplate.displayName = 'TripPlannerTemplate';
