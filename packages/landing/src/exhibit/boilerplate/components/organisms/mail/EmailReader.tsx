import type { FC } from 'react';

interface EmailAttachment {
  id: string;
  name: string;
  size: string;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  attachments?: EmailAttachment[];
}

interface EmailReaderProps {
  email: Email;
  onReply?: () => void;
  onForward?: () => void;
}

export const EmailReader: FC<EmailReaderProps> = ({
  email,
  onReply,
  onForward,
}) => (
  <article
    className="bg-base-200 border-base-content/10 flex w-full flex-col gap-3 rounded-xl border p-4"
    data-testid="email-reader">
    <header className="flex items-start justify-between gap-2">
      <div>
        <h3 className="card-title">{email.subject}</h3>
        <p className="text-sm font-medium">{email.from}</p>
        <p className="text-base-content/40 text-xs">{email.time}</p>
      </div>
      <div className="avatar placeholder">
        <div className="bg-primary text-primary-content w-10 rounded-full">
          <span>
            {email.from
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </span>
        </div>
      </div>
    </header>
    <div className="border-base-content/10 border-t pt-3">
      <p className="text-sm leading-relaxed whitespace-pre-line">
        {email.body}
      </p>
    </div>
    {email.attachments && email.attachments.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {email.attachments.map((attachment) => (
          <span
            key={attachment.id}
            className="badge badge-ghost flex items-center gap-1 py-3">
            📎 {attachment.name} · {attachment.size}
          </span>
        ))}
      </div>
    )}
    <footer className="mt-auto flex gap-2">
      <button
        type="button"
        onClick={onReply}
        className="btn btn-primary btn-sm">
        Reply
      </button>
      <button
        type="button"
        onClick={onForward}
        className="btn btn-ghost btn-sm">
        Forward
      </button>
    </footer>
  </article>
);

EmailReader.displayName = 'EmailReader';
