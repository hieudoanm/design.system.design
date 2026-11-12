'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { FiSmartphone, FiCamera } from 'react-icons/fi';

interface QRCodeActionsProps {
  onShowQR: () => void;
  onScan?: (result: string) => void;
}

const QRCodeActions: FC<QRCodeActionsProps> = ({ onShowQR, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('[QRCodeActions] camera error', err);
      setCameraError('Camera access denied. Tap anywhere to simulate scan.');
    }
  }, []);

  const handleOpenScanner = useCallback(() => {
    setScanning(true);
    startCamera();
  }, [startCamera]);

  const handleCloseScanner = useCallback(() => {
    stopCamera();
    setScanning(false);
    setCameraError(null);
  }, [stopCamera]);

  const handleSimulateScan = useCallback(() => {
    const mockResult = `wallet://pay?to=alex&amount=${Date.now()}`;
    console.log('[QRCodeActions] simulated scan', { mockResult });
    handleCloseScanner();
    onScan?.(mockResult);
  }, [handleCloseScanner, onScan]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <button
          className="card bg-base-200 shadow-md hover:shadow-lg"
          onClick={onShowQR}>
          <div className="card-body items-center gap-2">
            <FiSmartphone className="text-4xl" />
            <p className="font-medium">Show QR Code</p>
            <p className="text-base-content/60 text-xs">
              Let others scan to pay you
            </p>
          </div>
        </button>

        <button
          className="card bg-base-200 shadow-md hover:shadow-lg"
          onClick={handleOpenScanner}>
          <div className="card-body items-center gap-2">
            <FiCamera className="text-4xl" />
            <p className="font-medium">Scan QR Code</p>
            <p className="text-base-content/60 text-xs">
              Scan to make a payment
            </p>
          </div>
        </button>
      </div>

      {scanning && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Scan QR Code</h3>
            <div
              className="bg-base-300 relative my-4 aspect-square cursor-pointer overflow-hidden rounded-lg"
              onClick={handleSimulateScan}>
              {cameraError ? (
                <div className="flex h-full items-center justify-center p-4">
                  <p className="text-base-content/60 text-center text-sm">
                    {cameraError}
                  </p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="border-primary/60 h-2/3 w-2/3 rounded-lg border-2 border-dashed" />
              </div>
            </div>
            <p className="text-base-content/60 text-center text-xs">
              Point camera at a QR code or tap to simulate
            </p>
            <div className="modal-action">
              <button
                className="btn btn-neutral"
                onClick={handleCloseScanner}
                aria-label="Close scanner">
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default QRCodeActions;
