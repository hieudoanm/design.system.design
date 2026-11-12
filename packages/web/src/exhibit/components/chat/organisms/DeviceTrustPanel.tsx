'use client';

import { type FC } from 'react';
import {
  FaTimes,
  FaLaptop,
  FaMobileAlt,
  FaShieldAlt,
  FaCheck,
} from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';

interface DeviceTrustPanelProps {
  onClose: () => void;
}

export const DeviceTrustPanel: FC<DeviceTrustPanelProps> = ({ onClose }) => {
  const { deviceTrustList, removeTrustedDevice, verifyDevice } = useData();

  return (
    <div className="bg-base-100 flex h-full w-full flex-col md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <FaShieldAlt className="h-4 w-4" />
        <h2 className="flex-1 font-semibold">Trusted Devices</h2>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-xs btn-ghost"
          aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {deviceTrustList.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <FaLaptop className="text-base-content/20 mb-3 h-10 w-10" />
            <p className="text-base-content/50 text-sm">No trusted devices.</p>
            <p className="text-base-content/40 mt-1 text-xs">
              Devices appear here after you verify them.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {deviceTrustList.map((device) => (
              <div
                key={device.deviceId}
                className="bg-base-200 flex items-center gap-3 rounded-xl p-3">
                <div className="bg-base-300 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <FaMobileAlt className="h-5 w-5 opacity-50" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {device.deviceLabel}
                  </p>
                  <p className="text-base-content/40 text-xs">
                    {device.verified ? (
                      <span className="text-success flex items-center gap-1">
                        <FaCheck className="h-2.5 w-2.5" /> Verified
                      </span>
                    ) : (
                      'Unverified'
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!device.verified && (
                    <button
                      type="button"
                      onClick={() => void verifyDevice(device.deviceId)}
                      className="btn btn-xs btn-primary">
                      Verify
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void removeTrustedDevice(device.deviceId)}
                    className="btn btn-xs btn-ghost text-error">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
