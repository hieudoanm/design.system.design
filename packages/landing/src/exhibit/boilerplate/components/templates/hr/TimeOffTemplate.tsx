'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';

type LeaveType = 'Vacation' | 'Sick' | 'Personal';
type RequestStatus = 'Approved' | 'Pending' | 'Rejected';
type RequestFilter = 'All' | RequestStatus;

interface TimeOffRequest {
  id: string;
  employee: string;
  type: LeaveType;
  dates: string;
  status: RequestStatus;
}

const REQUESTS: TimeOffRequest[] = [
  {
    id: 'r1',
    employee: 'Priya Patel',
    type: 'Vacation',
    dates: 'Aug 12-16',
    status: 'Approved',
  },
  {
    id: 'r2',
    employee: 'Lena Kim',
    type: 'Sick',
    dates: 'Aug 07-08',
    status: 'Approved',
  },
  {
    id: 'r3',
    employee: 'Omar Haddad',
    type: 'Personal',
    dates: 'Aug 21',
    status: 'Pending',
  },
  {
    id: 'r4',
    employee: 'Sofia Rossi',
    type: 'Vacation',
    dates: 'Sep 02-06',
    status: 'Pending',
  },
  {
    id: 'r5',
    employee: 'David Chen',
    type: 'Sick',
    dates: 'Jul 30-31',
    status: 'Rejected',
  },
  {
    id: 'r6',
    employee: 'Maya Singh',
    type: 'Personal',
    dates: 'Aug 28-29',
    status: 'Pending',
  },
];

const FILTERS: RequestFilter[] = ['All', 'Approved', 'Pending', 'Rejected'];

const getTypeBadge = (type: LeaveType) => {
  switch (type) {
    case 'Vacation':
      return <span className="badge badge-info badge-sm">Vacation</span>;
    case 'Sick':
      return <span className="badge badge-warning badge-sm">Sick</span>;
    default:
      return <span className="badge badge-neutral badge-sm">Personal</span>;
  }
};

const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case 'Approved':
      return <span className="badge badge-success badge-sm">Approved</span>;
    case 'Rejected':
      return <span className="badge badge-error badge-sm">Rejected</span>;
    default:
      return <span className="badge badge-warning badge-sm">Pending</span>;
  }
};

export const TimeOffTemplate: FC = () => {
  const [requests, setRequests] = useState<TimeOffRequest[]>(REQUESTS);
  const [filter, setFilter] = useState<RequestFilter>('All');

  const visible = requests.filter(
    (request) => filter === 'All' || request.status === filter
  );

  const setStatus = (id: string, status: RequestStatus) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Time Off</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Leave requests and balances.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiCalendar />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Requests</p>
              <p className="text-2xl font-bold tracking-tight">
                {visible.length} requests
              </p>
            </div>
          </div>
        </div>

        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`tab ${filter === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Dates</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((request) => (
                    <tr
                      key={request.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {request.employee}
                      </td>
                      <td className="px-4 py-3">
                        {getTypeBadge(request.type)}
                      </td>
                      <td className="px-4 py-3 text-sm">{request.dates}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-4 py-3">
                        {request.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setStatus(request.id, 'Approved')}
                              className="btn btn-ghost btn-xs">
                              Approve
                            </button>
                            <button
                              onClick={() => setStatus(request.id, 'Rejected')}
                              className="btn btn-ghost btn-xs">
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

TimeOffTemplate.displayName = 'TimeOffTemplate';
