'use client';

import { type FC } from 'react';
import { FiSmartphone } from 'react-icons/fi';

interface SecuritySettingsCardProps {
  autoLock: number;
  onAutoLockChange: (value: number) => void;
  clipClear: number;
  onClipClearChange: (value: number) => void;
  biometric: boolean;
  onBiometricChange: (value: boolean) => void;
  lockOnClose: boolean;
  onLockOnCloseChange: (value: boolean) => void;
}

export const SecuritySettingsCard: FC<SecuritySettingsCardProps> = ({
  autoLock,
  onAutoLockChange,
  clipClear,
  onClipClearChange,
  biometric,
  onBiometricChange,
  lockOnClose,
  onLockOnCloseChange,
}) => (
  <div className="card bg-base-200 card-body">
    <h2 className="card-title">Security</h2>
    <label className="label">
      <span className="label-text">Auto-lock timeout: {autoLock} min</span>
    </label>
    <input
      type="range"
      min={1}
      max={60}
      value={autoLock}
      onChange={(e) => onAutoLockChange(parseInt(e.target.value))}
      className="range range-primary"
    />
    <label className="label">
      <span className="label-text">Clipboard clear: {clipClear}s</span>
    </label>
    <input
      type="range"
      min={10}
      max={120}
      value={clipClear}
      onChange={(e) => onClipClearChange(parseInt(e.target.value))}
      className="range range-primary"
    />
    <label className="label cursor-pointer justify-start gap-3">
      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={biometric}
        onChange={(e) => onBiometricChange(e.target.checked)}
      />
      <span className="label-text">
        <FiSmartphone className="inline size-4" /> Biometric unlock (mock)
      </span>
    </label>
    <label className="label cursor-pointer justify-start gap-3">
      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={lockOnClose}
        onChange={(e) => onLockOnCloseChange(e.target.checked)}
      />
      <span className="label-text">Auto-lock on browser close</span>
    </label>
  </div>
);
