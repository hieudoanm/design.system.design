'use client';

import { type FC, useState } from 'react';
import {
  FaTimes,
  FaEye,
  FaCamera,
  FaCheckDouble,
  FaKeyboard,
  FaUserShield,
  FaLock,
} from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import type { PrivacySettings } from '@/exhibit/types/chat';

const VISIBILITY_OPTIONS: {
  value: PrivacySettings['lastSeen'];
  label: string;
}[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'contacts', label: 'My Contacts' },
  { value: 'nobody', label: 'Nobody' },
];

interface RowProps {
  icon: FC<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}

const Row: FC<RowProps> = ({ icon: Icon, label, children }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 opacity-60" />
      <span className="text-sm">{label}</span>
    </div>
    {children}
  </div>
);

interface PrivacySettingsPanelProps {
  onClose: () => void;
  onOpenPin?: () => void;
  onOpenBlocked?: () => void;
  onOpenDevices?: () => void;
}

export const PrivacySettingsPanel: FC<PrivacySettingsPanelProps> = ({
  onClose,
  onOpenBlocked,
  onOpenDevices,
}) => {
  const { privacySettings, updatePrivacySettings } = useData();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const { setPin: savePin } = useData();

  const handleSavePin = (): void => {
    if (pin === pinConfirm && pin.length >= 4) {
      void savePin(pin);
      setShowPinSetup(false);
      setPin('');
      setPinConfirm('');
    }
  };

  return (
    <div className="bg-base-100 flex h-full w-full flex-col md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <FaUserShield className="h-4 w-4" />
        <h2 className="flex-1 font-semibold">Privacy & Security</h2>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-xs btn-ghost"
          aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <h3 className="text-base-content/50 text-xs font-semibold uppercase">
            Who can see
          </h3>
          <Row icon={FaEye} label="Last seen">
            <select
              value={privacySettings.lastSeen}
              onChange={(e) =>
                updatePrivacySettings({
                  lastSeen: e.target.value as PrivacySettings['lastSeen'],
                })
              }
              className="select select-sm select-bordered">
              {VISIBILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Row>
          <Row icon={FaCamera} label="Profile photo">
            <select
              value={privacySettings.profilePhoto}
              onChange={(e) =>
                updatePrivacySettings({
                  profilePhoto: e.target
                    .value as PrivacySettings['profilePhoto'],
                })
              }
              className="select select-sm select-bordered">
              {VISIBILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Row>

          <h3 className="text-base-content/50 pt-3 text-xs font-semibold uppercase">
            Messaging
          </h3>
          <Row icon={FaCheckDouble} label="Read receipts">
            <input
              type="checkbox"
              checked={privacySettings.readReceipts}
              onChange={() =>
                updatePrivacySettings({
                  readReceipts: !privacySettings.readReceipts,
                })
              }
              className="toggle toggle-sm"
              aria-label="Toggle read receipts"
            />
          </Row>
          <Row icon={FaKeyboard} label="Typing indicators">
            <input
              type="checkbox"
              checked={privacySettings.typingIndicators}
              onChange={() =>
                updatePrivacySettings({
                  typingIndicators: !privacySettings.typingIndicators,
                })
              }
              className="toggle toggle-sm"
              aria-label="Toggle typing indicators"
            />
          </Row>

          <h3 className="text-base-content/50 pt-3 text-xs font-semibold uppercase">
            Security
          </h3>
          <button
            type="button"
            onClick={() => setShowPinSetup(!showPinSetup)}
            className="hover:bg-base-200 flex w-full items-center gap-2 rounded-lg py-2 text-left text-sm">
            <FaLock className="h-4 w-4 opacity-60" />
            <span className="flex-1">PIN Lock</span>
            <span className="text-base-content/40 text-xs">
              {privacySettings.pinEnabled ? 'On' : 'Off'}
            </span>
          </button>
          {showPinSetup && (
            <div className="bg-base-200 space-y-2 rounded-lg p-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="New PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input input-sm input-bordered w-full"
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Confirm PIN"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value)}
                className="input input-sm input-bordered w-full"
              />
              <button
                type="button"
                onClick={handleSavePin}
                disabled={pin.length < 4 || pin !== pinConfirm}
                className="btn btn-sm btn-primary w-full">
                Save PIN
              </button>
            </div>
          )}
          {onOpenBlocked && (
            <button
              type="button"
              onClick={onOpenBlocked}
              className="hover:bg-base-200 flex w-full items-center gap-2 rounded-lg py-2 text-left text-sm">
              <span className="flex-1">Blocked Contacts</span>
              <span className="text-base-content/40 text-xs">
                {privacySettings.blockedContactIds.length}
              </span>
            </button>
          )}
          {onOpenDevices && (
            <button
              type="button"
              onClick={onOpenDevices}
              className="hover:bg-base-200 flex w-full items-center gap-2 rounded-lg py-2 text-left text-sm">
              <span className="flex-1">Trusted Devices</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
