'use client';

import { type FC } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';

interface CameraCaptureProps {
  onCapture: () => void;
  onClose: () => void;
}

export const CameraCapture: FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
}) => (
  <div
    data-testid="camera-capture"
    className="absolute inset-0 z-40 flex flex-col bg-black">
    <div className="flex items-center justify-between p-4 text-white">
      <button
        type="button"
        aria-label="Close camera"
        onClick={onClose}
        className="btn btn-ghost btn-sm btn-circle text-white">
        <FiX className="size-4" />
      </button>
      <span className="text-xs">Camera</span>
      <span className="w-8" />
    </div>
    <div className="relative flex-1 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, #334155 0%, #020617 80%)',
        }}
      />
      <div className="absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-white/40" />
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-white/60 uppercase">
        Point at your subject
      </span>
    </div>
    <div className="flex items-center justify-center py-6">
      <button
        type="button"
        aria-label="Capture photo"
        onClick={onCapture}
        className="btn btn-circle btn-lg border-4 border-white bg-white/20 hover:bg-white/30">
        <FiCamera className="size-6 text-white" />
      </button>
    </div>
  </div>
);
