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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-base-100 card w-full max-w-sm shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="text-sm opacity-70">{message}</p>
        <div className="card-actions justify-end">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-error">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);
