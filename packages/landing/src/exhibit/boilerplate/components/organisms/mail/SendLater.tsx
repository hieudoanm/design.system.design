import type { FC } from 'react';

interface ScheduledSend {
  id: string;
  to: string;
  subject: string;
  scheduledAt: string;
  status: 'scheduled' | 'sent' | 'failed';
}

interface SendLaterProps {
  scheduled: ScheduledSend[];
  onCancel?: (item: ScheduledSend) => void;
  onReschedule?: (item: ScheduledSend) => void;
}

const statusClass: Record<ScheduledSend['status'], string> = {
  scheduled: 'badge-info',
  sent: 'badge-success',
  failed: 'badge-error',
};

export const SendLater: FC<SendLaterProps> = ({
  scheduled,
  onCancel,
  onReschedule,
}) => (
  <div
    className="border-base-content/10 bg-base-200 w-full overflow-hidden rounded-xl border"
    data-testid="send-later">
    <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-sm font-medium">Scheduled sends</h3>
      <span className="badge badge-ghost badge-sm">{scheduled.length}</span>
    </header>
    <ul className="flex flex-col">
      {scheduled.map((item) => (
        <li
          key={item.id}
          className="hover:bg-base-300/60 flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.subject}</p>
            <p className="text-base-content/50 text-xs">
              To {item.to} · {item.scheduledAt}
            </p>
          </div>
          <span className={`badge badge-sm ${statusClass[item.status]}`}>
            {item.status}
          </span>
          <button
            type="button"
            onClick={() => onReschedule?.(item)}
            className="btn btn-ghost btn-xs">
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => onCancel?.(item)}
            className="btn btn-ghost btn-xs text-error">
            Cancel
          </button>
        </li>
      ))}
      {scheduled.length === 0 && (
        <li className="text-base-content/40 p-4 text-center text-sm">
          Nothing scheduled
        </li>
      )}
    </ul>
  </div>
);

SendLater.displayName = 'SendLater';
