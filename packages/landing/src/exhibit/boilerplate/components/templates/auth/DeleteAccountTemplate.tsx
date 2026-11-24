'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';

export const DeleteAccountTemplate: FC = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequest = () => {
    if (confirmed) setRequested(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Delete Account" backHref="/" />

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="bg-error/10 flex h-14 w-14 items-center justify-center rounded-2xl">
            <FiAlertTriangle className="text-error h-6 w-6" />
          </div>
          <h2>Delete account</h2>
          <p className="text-base-content/50 text-sm">
            This action cannot be undone.
          </p>
        </div>

        {requested && (
          <div className="alert alert-error mb-6 text-sm">
            <FiAlertTriangle size={16} />
            Account deletion requested
          </div>
        )}

        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Danger zone</p>
              <p className="text-base-content/50 text-sm leading-relaxed">
                Deleting your account will permanently remove all your data,
                orders, and personal information. This cannot be reversed.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <span className="text-sm">I understand this is permanent</span>
            </label>

            <button
              type="button"
              onClick={handleRequest}
              disabled={!confirmed}
              className="btn btn-error gap-1">
              <FiTrash2 className="h-4 w-4" />
              Delete account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

DeleteAccountTemplate.displayName = 'DeleteAccountTemplate';
