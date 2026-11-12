'use client';

import { type FC, useEffect, useState } from 'react';
import { FiAlertTriangle, FiShield } from 'react-icons/fi';
import { useData } from '@/exhibit/providers/password/DataProvider';

const minute = 60000;

const formatRemaining = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}m ${secs}s`;
};

export const EmergencyAccessCard: FC = () => {
  const { settings, requestEmergencyAccess, cancelEmergencyRequest } =
    useData();
  const [email, setEmail] = useState('');
  const [delay, setDelay] = useState(30);
  const [now, setNow] = useState(Date.now());
  const contact = settings.emergencyContact;
  const request = settings.emergencyRequest;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const granted =
    request !== undefined &&
    now >= request.requestedAt + request.delayMinutes * minute;

  return (
    <div className="card bg-base-200 card-body">
      <h2 className="card-title">
        <FiShield className="size-5" /> Emergency Access
      </h2>
      {!contact ? (
        <div className="space-y-3">
          <p className="text-base-content/60 text-sm">
            Choose a trusted contact who can request access to your vault after
            a delay. The delay gives you time to deny an unauthorized request.
          </p>
          <input
            type="email"
            placeholder="contact@example.com"
            aria-label="Emergency contact email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-sm input-bordered w-full"
          />
          <select
            aria-label="Emergency access delay"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="select select-sm select-bordered w-full">
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={1440}>24 hours</option>
          </select>
          <button
            type="button"
            disabled={!email.trim()}
            onClick={() => {
              void requestEmergencyAccess(email.trim(), delay);
            }}
            className="btn btn-primary btn-sm w-full">
            Save emergency contact
          </button>
        </div>
      ) : granted ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-success size-4" />
            <span className="badge badge-success">Access granted</span>
          </div>
          <p className="text-base-content/70 text-sm">
            Emergency access to this vault is now available.
          </p>
          <button
            type="button"
            onClick={() => void cancelEmergencyRequest()}
            className="btn btn-ghost btn-sm w-full">
            End emergency access
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-base-content/70 text-sm">
            Contact: <span className="font-semibold">{contact.email}</span> ·
            delay {contact.delayMinutes} min
          </p>
          {request ? (
            <>
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                <span className="text-sm">
                  Requested — available in{' '}
                  <span className="font-semibold">
                    {formatRemaining(
                      request.requestedAt + request.delayMinutes * minute - now
                    )}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => void cancelEmergencyRequest()}
                className="btn btn-ghost btn-sm w-full">
                Cancel request
              </button>
            </>
          ) : (
            <>
              <p className="text-base-content/60 text-sm">
                Requesting access notifies the vault owner. Access is granted
                after the delay unless it is denied.
              </p>
              <button
                type="button"
                onClick={() =>
                  void requestEmergencyAccess(
                    contact.email,
                    contact.delayMinutes
                  )
                }
                className="btn btn-warning btn-sm w-full">
                Request emergency access
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
