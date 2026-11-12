'use client';

import { type FC, useState } from 'react';
import { FaTimes, FaBan, FaUserShield } from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';

interface BlockedContactsPanelProps {
  onClose: () => void;
}

export const BlockedContactsPanel: FC<BlockedContactsPanelProps> = ({
  onClose,
}) => {
  const { contacts, privacySettings, unblockContact } = useData();
  const [confirmUnblock, setConfirmUnblock] = useState<string | null>(null);

  const blockedContacts = contacts.filter((c) =>
    privacySettings.blockedContactIds.includes(c.id)
  );

  return (
    <div className="bg-base-100 flex h-full w-full flex-col md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <FaBan className="h-4 w-4" />
        <h2 className="flex-1 font-semibold">Blocked Contacts</h2>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-xs btn-ghost"
          aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {blockedContacts.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <FaUserShield className="text-base-content/20 mb-3 h-10 w-10" />
            <p className="text-base-content/50 text-sm">No blocked contacts.</p>
            <p className="text-base-content/40 mt-1 text-xs">
              Blocked contacts cannot send you messages.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-base-200 flex items-center gap-3 rounded-xl p-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: contact.avatarColor }}>
                  {contact.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{contact.name}</p>
                  <p className="text-base-content/40 text-xs">
                    @{contact.username}
                  </p>
                </div>
                {confirmUnblock === contact.id ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        void unblockContact(contact.id);
                        setConfirmUnblock(null);
                      }}
                      className="btn btn-xs btn-primary">
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmUnblock(null)}
                      className="btn btn-xs btn-ghost">
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmUnblock(contact.id)}
                    className="btn btn-xs btn-ghost text-error">
                    Unblock
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
