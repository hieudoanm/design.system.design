'use client';

import { type FC } from 'react';
import {
  FaTimes,
  FaDesktop,
  FaMobileAlt,
  FaLaptop,
  FaSync,
  FaKey,
  FaShieldAlt,
} from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import type { PairedDevice } from '@/exhibit/types/chat';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

const deviceIcon = (label: string) => {
  if (label.toLowerCase().includes('mobile'))
    return <FaMobileAlt className="h-4 w-4" />;
  if (label.toLowerCase().includes('laptop'))
    return <FaLaptop className="h-4 w-4" />;
  return <FaDesktop className="h-4 w-4" />;
};

interface DeviceSyncPanelProps {
  onClose: () => void;
  onPairNew: () => void;
}

export const DeviceSyncPanel: FC<DeviceSyncPanelProps> = ({
  onClose,
  onPairNew,
}) => {
  const { pairedDevices, syncState, syncNow, removePairedDevice } = useData();

  return (
    <div className="bg-base-100 flex h-full w-full flex-col md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <FaSync className="h-4 w-4" />
        <h2 className="flex-1 font-semibold">Devices & Sync</h2>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-xs btn-ghost"
          aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h3 className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
            Current Device
          </h3>
          <div className="bg-base-200 flex items-center gap-3 rounded-xl p-3">
            <FaDesktop className="text-primary h-5 w-5" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">This device</p>
              <p className="text-base-content/40 text-xs">
                ID: {syncState.deviceId.slice(0, 8)}…
              </p>
            </div>
            <span className="badge badge-success badge-sm">Active</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
              Paired Devices ({pairedDevices.length})
            </h3>
            <button
              type="button"
              onClick={onPairNew}
              className="btn btn-xs btn-primary">
              + Pair
            </button>
          </div>
          {pairedDevices.length === 0 ? (
            <p className="text-base-content/40 py-4 text-center text-xs">
              No paired devices yet.
            </p>
          ) : (
            <div className="space-y-2">
              {pairedDevices.map((device) => (
                <PairedDeviceCard
                  key={device.id}
                  device={device}
                  onRemove={() => removePairedDevice(device.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
            Sync Status
          </h3>
          <div className="bg-base-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              <FaKey className="h-3 w-3" />
              <span>Key backup v{syncState.keyBackupVersion}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaSync className="h-3 w-3" />
              <span>Last sync: {formatTime(syncState.lastSyncAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaShieldAlt className="h-3 w-3" />
              <span>{syncState.pendingSyncCount} pending</span>
            </div>
            <button
              type="button"
              onClick={syncNow}
              className="btn btn-outline btn-xs mt-3 w-full">
              Sync Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PairedDeviceCard: FC<{ device: PairedDevice; onRemove: () => void }> = ({
  device,
  onRemove,
}) => (
  <div className="bg-base-200 flex items-center gap-3 rounded-xl p-3">
    {deviceIcon(device.label)}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{device.label}</p>
      <p className="text-base-content/40 text-xs">
        {device.online
          ? 'Online'
          : `Last seen ${formatTime(device.lastSeenAt)}`}
      </p>
    </div>
    {device.online ? (
      <span className="badge badge-success badge-sm">Online</span>
    ) : (
      <span className="badge badge-ghost badge-sm">Offline</span>
    )}
    <button
      type="button"
      onClick={onRemove}
      className="btn btn-xs btn-ghost text-error"
      aria-label="Remove device">
      <FaTimes />
    </button>
  </div>
);
