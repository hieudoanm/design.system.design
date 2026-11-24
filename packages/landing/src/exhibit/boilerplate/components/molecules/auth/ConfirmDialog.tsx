import { FiAlertTriangle } from 'react-icons/fi';
import type { FC } from 'react';
import { Modal } from '../../molecules/support/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    action={
      <div className="flex gap-2">
        <button type="button" className="btn" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-error' : 'btn-primary'}`}
          disabled={loading}
          onClick={onConfirm}>
          {loading && <span className="loading loading-spinner loading-sm" />}
          {confirmLabel}
        </button>
      </div>
    }>
    {message && (
      <div className="flex items-start gap-2">
        <FiAlertTriangle className="text-warning mt-0.5 shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
    )}
  </Modal>
);
