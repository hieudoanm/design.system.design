import type { FC } from 'react';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
}

interface InboxTableProps {
  emails: Email[];
  onSelect?: (id: string) => void;
}

export const InboxTable: FC<InboxTableProps> = ({ emails, onSelect }) => (
  <div className="overflow-x-auto">
    <table className="table-zebra table" data-testid="inbox-table">
      <thead>
        <tr>
          <th>From</th>
          <th>Subject</th>
          <th className="text-right">Time</th>
        </tr>
      </thead>
      <tbody>
        {emails.map((email) => (
          <tr
            key={email.id}
            data-testid="inbox-row"
            onClick={() => onSelect?.(email.id)}
            className={email.unread ? 'font-semibold' : ''}>
            <td>{email.from}</td>
            <td>
              <span>{email.subject}</span>
              <span className="text-base-content/50 text-sm">
                {' '}
                — {email.preview}
              </span>
            </td>
            <td className="text-base-content/50 text-right text-sm">
              {email.time}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

InboxTable.displayName = 'InboxTable';
