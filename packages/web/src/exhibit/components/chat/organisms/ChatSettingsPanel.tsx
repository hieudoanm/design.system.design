'use client';

import { type FC } from 'react';
import {
  FaTimes,
  FaBell,
  FaBellSlash,
  FaImage,
  FaLock,
  FaEyeSlash,
} from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import type { Chat } from '@/exhibit/types/chat';

const WALLPAPER_OPTIONS = [
  { value: '', label: 'Default' },
  { value: '#1a1b26', label: 'Dark navy' },
  { value: '#1e1e2e', label: 'Dark purple' },
  { value: '#1a2332', label: 'Ocean dark' },
  { value: '#2d1b2e', label: 'Berry dark' },
];

interface ChatSettingsPanelProps {
  chat: Chat;
  onClose: () => void;
}

export const ChatSettingsPanel: FC<ChatSettingsPanelProps> = ({
  chat,
  onClose,
}) => {
  const { toggleMute, toggleSecret, updateChatSettings } = useData();

  return (
    <div className="border-base-300 bg-base-100 flex h-full w-full flex-col border-r md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <h2 className="flex-1 font-semibold">Chat Settings</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="btn btn-xs btn-ghost">
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <h3 className="text-base-content/50 text-xs font-semibold uppercase">
            Notifications
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {chat.muted ? (
                <FaBellSlash className="h-4 w-4" />
              ) : (
                <FaBell className="h-4 w-4" />
              )}
              <span className="text-sm">Mute notifications</span>
            </div>
            <input
              type="checkbox"
              checked={chat.muted}
              onChange={() => toggleMute(chat.id)}
              className="toggle toggle-sm"
              aria-label="Toggle mute"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notification sound</span>
            <input
              type="checkbox"
              checked={chat.settings.notificationSound}
              onChange={() =>
                updateChatSettings(chat.id, {
                  notificationSound: !chat.settings.notificationSound,
                })
              }
              className="toggle toggle-sm"
              aria-label="Toggle notification sound"
            />
          </div>

          <h3 className="text-base-content/50 pt-2 text-xs font-semibold uppercase">
            Wallpaper
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {WALLPAPER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  updateChatSettings(chat.id, { wallpaper: opt.value })
                }
                aria-label={`Set wallpaper to ${opt.label}`}
                className={`aspect-square rounded-lg border-2 transition ${
                  chat.settings.wallpaper === opt.value
                    ? 'border-primary'
                    : 'hover:border-base-300 border-transparent'
                }`}
                style={{
                  backgroundColor: opt.value || 'hsl(var(--b2))',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <FaImage className="h-4 w-4" />
            <span className="text-sm">
              {WALLPAPER_OPTIONS.find(
                (o) => o.value === chat.settings.wallpaper
              )?.label ?? 'Default'}
            </span>
          </div>

          <h3 className="text-base-content/50 pt-2 text-xs font-semibold uppercase">
            Disappearing Messages
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">Timer (seconds)</span>
            <select
              value={chat.settings.disappearingSeconds}
              onChange={(e) =>
                updateChatSettings(chat.id, {
                  disappearingSeconds: Number(e.target.value),
                })
              }
              className="select select-sm select-bordered">
              <option value={0}>Off</option>
              <option value={30}>30s</option>
              <option value={60}>1 min</option>
              <option value={300}>5 min</option>
              <option value={3600}>1 hour</option>
            </select>
          </div>

          <h3 className="text-base-content/50 pt-2 text-xs font-semibold uppercase">
            Encryption
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaLock className="h-4 w-4" />
              <span className="text-sm">Secret chat</span>
            </div>
            <input
              type="checkbox"
              checked={chat.isSecret}
              onChange={() => toggleSecret(chat.id)}
              className="toggle toggle-sm"
              aria-label="Toggle secret chat"
            />
          </div>
          {chat.isSecret && (
            <div className="bg-warning/10 flex items-center gap-2 rounded-lg px-3 py-2">
              <FaEyeSlash className="text-warning h-4 w-4 shrink-0" />
              <p className="text-xs">
                Screenshot protection is enabled. Messages disappear
                automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
