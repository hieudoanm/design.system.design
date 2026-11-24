import type { FC } from 'react';

interface Attachment {
  id: string;
  name: string;
  size: string;
  kind?: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  onDownload?: (id: string) => void;
}

export const AttachmentList: FC<AttachmentListProps> = ({
  attachments,
  onDownload,
}) => (
  <div className="flex flex-col gap-2" data-testid="attachment-list">
    {attachments.length === 0 && (
      <p className="text-base-content/50 text-sm">No attachments.</p>
    )}
    {attachments.map((attachment) => (
      <div
        key={attachment.id}
        className="border-base-content/10 bg-base-200/50 flex items-center gap-3 rounded-lg border px-3 py-2">
        <span className="text-base-content/60 text-lg">📎</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{attachment.name}</p>
          <p className="text-base-content/50 text-xs">
            {attachment.kind && `${attachment.kind} · `}
            {attachment.size}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onDownload?.(attachment.id)}>
          Download
        </button>
      </div>
    ))}
  </div>
);

AttachmentList.displayName = 'AttachmentList';
