import type { FC } from 'react';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface AttachmentViewerProps {
  attachments: Attachment[];
  onDownload?: (attachment: Attachment) => void;
}

const iconForType = (type: string): string => {
  if (type.startsWith('image')) return '🖼️';
  if (type.startsWith('video')) return '🎬';
  if (type.includes('pdf')) return '📕';
  return '📎';
};

export const AttachmentViewer: FC<AttachmentViewerProps> = ({
  attachments,
  onDownload,
}) => (
  <div
    className="bg-base-200 border-base-content/10 w-full rounded-xl border p-4"
    data-testid="attachment-viewer">
    <h3 className="mb-3 text-sm font-medium">Attachments</h3>
    <ul className="flex flex-col gap-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="border-base-content/10 bg-base-100 flex items-center gap-3 rounded-xl border px-3 py-2">
          <span className="text-xl">{iconForType(attachment.type)}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{attachment.name}</p>
            <p className="text-base-content/50 text-xs">
              {attachment.type} · {attachment.size}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDownload?.(attachment)}
            className="btn btn-ghost btn-xs ml-auto">
            Download
          </button>
        </li>
      ))}
      {attachments.length === 0 && (
        <li className="text-base-content/40 text-center text-sm">
          No attachments
        </li>
      )}
    </ul>
  </div>
);

AttachmentViewer.displayName = 'AttachmentViewer';
