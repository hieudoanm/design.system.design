import type { FC } from 'react';

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  title?: string;
}

export const EmergencyContacts: FC<EmergencyContactsProps> = ({
  contacts,
  title = 'Emergency contacts',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-3">
      <h3 className="card-title">{title}</h3>
      {contacts.map((contact) => (
        <article
          key={contact.id}
          className="bg-base-100 border-base-content/10 flex items-center gap-3 rounded-xl border p-4">
          <div className="avatar">
            <div className="bg-error text-error-content flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium">
              {contact.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{contact.name}</span>
              <span className="badge badge-ghost badge-sm">
                {contact.relation}
              </span>
            </div>
            <a
              className="text-base-content/60 link-hover text-xs"
              href={`tel:${contact.phone}`}>
              {contact.phone}
            </a>
          </div>
          <a
            className="btn btn-error btn-sm"
            href={`tel:${contact.phone}`}
            data-testid={`call-${contact.id}`}>
            Call
          </a>
        </article>
      ))}
      {contacts.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No emergency contacts.
        </p>
      )}
    </div>
  </section>
);
