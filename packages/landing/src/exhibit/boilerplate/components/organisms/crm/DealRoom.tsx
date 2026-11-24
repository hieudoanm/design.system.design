import type { FC } from 'react';

interface DealContact {
  id: string;
  name: string;
  email?: string;
}

interface DealActivity {
  id: string;
  text: string;
  time?: string;
}

interface DealRoomProps {
  dealName: string;
  company?: string;
  value?: number;
  stage?: string;
  owner?: string;
  expectedClose?: string;
  contacts?: DealContact[];
  activities?: DealActivity[];
}

const formatValue = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const DealRoom: FC<DealRoomProps> = ({
  dealName,
  company,
  value,
  stage,
  owner,
  expectedClose,
  contacts = [],
  activities = [],
}) => (
  <div className="grid gap-4 lg:grid-cols-3">
    <article className="card bg-base-200 border-base-content/10 rounded-xl border lg:col-span-2">
      <div className="card-body">
        <h2 className="card-title text-xl">{dealName}</h2>
        {company && <p className="text-base-content/50 text-sm">{company}</p>}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="stat bg-base-100 rounded-xl p-3">
            <dt className="text-base-content/40 text-xs">Value</dt>
            <dd className="text-lg font-medium">
              {value !== undefined ? formatValue(value) : '—'}
            </dd>
          </div>
          <div className="stat bg-base-100 rounded-xl p-3">
            <dt className="text-base-content/40 text-xs">Stage</dt>
            <dd className="text-sm font-medium">{stage ?? '—'}</dd>
          </div>
          <div className="stat bg-base-100 rounded-xl p-3">
            <dt className="text-base-content/40 text-xs">Owner</dt>
            <dd className="text-sm font-medium">{owner ?? '—'}</dd>
          </div>
          <div className="stat bg-base-100 rounded-xl p-3">
            <dt className="text-base-content/40 text-xs">Expected close</dt>
            <dd className="text-sm font-medium">{expectedClose ?? '—'}</dd>
          </div>
        </div>
      </div>
    </article>
    <aside className="flex flex-col gap-4">
      <div className="card bg-base-200 border-base-content/10 rounded-xl border">
        <div className="card-body">
          <h3 className="card-title text-base">Contacts</h3>
          <ul className="flex flex-col gap-2">
            {contacts.length === 0 && (
              <li className="text-base-content/50 text-sm">No contacts.</li>
            )}
            {contacts.map((contact) => (
              <li key={contact.id} className="text-sm">
                <p className="font-medium">{contact.name}</p>
                {contact.email && (
                  <p className="text-base-content/40">{contact.email}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card bg-base-200 border-base-content/10 rounded-xl border">
        <div className="card-body">
          <h3 className="card-title text-base">Activity</h3>
          <ul className="flex flex-col gap-2">
            {activities.length === 0 && (
              <li className="text-base-content/50 text-sm">No activity.</li>
            )}
            {activities.map((activity) => (
              <li key={activity.id} className="text-sm">
                <p>{activity.text}</p>
                {activity.time && (
                  <p className="text-base-content/40 text-xs">
                    {activity.time}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  </div>
);
