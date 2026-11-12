'use client';

import { FC, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '@/exhibit/providers/wallet/DataProvider';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
}

const QRCodeModal: FC<QRCodeModalProps> = ({ open, onClose }) => {
  const { user } = useData();

  const qrValue = useMemo(
    () =>
      `wallet://pay?user=${user?.id ?? '1'}&name=${encodeURIComponent(user?.name ?? 'User')}`,
    [user]
  );

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">Your QR Code</h3>
        <div className="bg-base-100 text-base-content my-4 flex items-center justify-center rounded-lg p-8">
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="M"
            fgColor="currentColor"
            bgColor="transparent"
          />
        </div>
        <p className="text-base-content/60 text-center text-sm">
          Scan this code to pay {user?.name ?? 'User'}
        </p>
        <div className="modal-action">
          <button
            className="btn btn-neutral"
            onClick={onClose}
            aria-label="Close QR code modal">
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default QRCodeModal;
