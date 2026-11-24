import type { FC, ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}

export const Modal: FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  action,
}) => {
  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        {title && <h3 className="text-lg font-bold">{title}</h3>}
        <div className="py-4">{children}</div>
        {action && <div className="modal-action">{action}</div>}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
