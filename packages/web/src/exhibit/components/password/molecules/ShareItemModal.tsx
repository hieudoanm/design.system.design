'use client';

import { type FC, useState } from 'react';
import { FiTrash2, FiX } from 'react-icons/fi';
import type {
  SharePermission,
  ShareRecipient,
  VaultItem,
} from '@/exhibit/types/password';

interface ShareItemModalProps {
  item: VaultItem;
  onShare: (recipient: ShareRecipient) => void;
  onRevoke: (email: string) => void;
  onClose: () => void;
}

export const ShareItemModal: FC<ShareItemModalProps> = ({
  item,
  onShare,
  onRevoke,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('view');
  const recipients = item.sharedWith ?? [];

  const handleAdd = (): void => {
    if (!email.trim()) return;
    onShare({ email: email.trim().toLowerCase(), permission });
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 card w-full max-w-md shadow-xl">
        <div className="card-body">
          <div className="card-title flex justify-between">
            Share "{item.title}"
            <button
              type="button"
              onClick={onClose}
              aria-label="Close share dialog"
              className="btn btn-ghost btn-sm btn-circle">
              <FiX className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="person@example.com"
              aria-label="Share with email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              className="input input-sm input-bordered flex-1"
            />
            <select
              aria-label="Share permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value as SharePermission)}
              className="select select-sm select-bordered">
              <option value="view">Can view</option>
              <option value="edit">Can edit</option>
            </select>
            <button
              type="button"
              disabled={!email.trim()}
              onClick={handleAdd}
              className="btn btn-primary btn-sm">
              Share
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {recipients.length === 0 && (
              <p className="text-base-content/50 py-2 text-center text-sm">
                Not shared with anyone yet
              </p>
            )}
            {recipients.map((r) => (
              <div
                key={r.email}
                className="bg-base-200 flex items-center gap-2 rounded-lg p-2">
                <span className="flex-1 truncate text-sm">{r.email}</span>
                <select
                  aria-label={`Permission for ${r.email}`}
                  value={r.permission}
                  onChange={(e) =>
                    onShare({
                      email: r.email,
                      permission: e.target.value as SharePermission,
                    })
                  }
                  className="select select-xs select-bordered">
                  <option value="view">Can view</option>
                  <option value="edit">Can edit</option>
                </select>
                <button
                  type="button"
                  aria-label={`Revoke share for ${r.email}`}
                  onClick={() => onRevoke(r.email)}
                  className="btn btn-ghost btn-xs btn-circle text-error">
                  <FiTrash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          {item.sharedBy && (
            <p className="text-base-content/50 text-xs">
              Shared with you by {item.sharedBy}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
