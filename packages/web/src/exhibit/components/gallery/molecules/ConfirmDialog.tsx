'use client';

import { type FC } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) => (
  <div className="bg-neutral/40 absolute inset-0 z-50 flex items-center justify-center p-6">
    <div className="bg-base-100 card w-full shadow-xl">
      <div className="card-body gap-3 p-5">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-base-content/70 text-xs">{message}</p>
        <div className="card-actions justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-error btn-sm">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);
