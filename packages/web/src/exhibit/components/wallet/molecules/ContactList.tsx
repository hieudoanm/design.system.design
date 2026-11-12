import { FC } from 'react';
import type { Contact } from '@/exhibit/types/wallet';
import { FiUser, FiStar, FiSend } from 'react-icons/fi';
import Link from 'next/link';

interface ContactListProps {
  contacts: Contact[];
  onSelect?: (contact: Contact) => void;
}

const ContactList: FC<ContactListProps> = ({ contacts, onSelect }) => {
  console.log('[ContactList] render', { count: contacts.length });

  return (
    <div className="flex flex-col gap-2">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="card bg-base-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="card-body flex-row items-center gap-3 p-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content w-10 rounded-full">
                <span className="text-sm">
                  {contact.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-medium">{contact.name}</span>
                {contact.frequentlyUsed && (
                  <FiStar className="text-warning text-xs" />
                )}
              </div>
              <span className="text-base-content/60 text-sm">
                {contact.email}
              </span>
            </div>

            <div className="flex gap-2">
              {onSelect ? (
                <button
                  className="btn btn-primary btn-sm gap-1"
                  onClick={() => onSelect(contact)}>
                  <FiSend className="text-sm" />
                  Select
                </button>
              ) : (
                <Link
                  href={`/design-system/exhibits/wallet`}
                  className="btn btn-primary btn-sm gap-1">
                  <FiSend className="text-sm" />
                  Send
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {contacts.length === 0 && (
        <div className="py-12 text-center">
          <FiUser className="text-base-content/30 mx-auto mb-3 text-4xl" />
          <p className="text-base-content/60">No contacts yet</p>
          <p className="text-base-content/40 text-sm">
            Add contacts to send money quickly
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactList;
