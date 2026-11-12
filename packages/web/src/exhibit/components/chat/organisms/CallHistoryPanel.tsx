'use client';

import { type FC } from 'react';
import {
  FaTimes,
  FaPhone,
  FaPhoneSlash,
  FaVideo,
  FaClock,
} from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import type { Call } from '@/exhibit/types/chat';

function formatCallTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const StatusIcon: FC<{ status: Call['status'] }> = ({ status }) => {
  switch (status) {
    case 'missed':
      return <FaPhoneSlash className="text-error h-3 w-3" />;
    case 'declined':
      return <FaPhoneSlash className="text-warning h-3 w-3" />;
    case 'ended':
      return <FaPhone className="text-success h-3 w-3" />;
    default:
      return <FaPhone className="text-info h-3 w-3" />;
  }
};

interface CallHistoryPanelProps {
  onClose: () => void;
  onCallBack: (chatId: string) => void;
}

export const CallHistoryPanel: FC<CallHistoryPanelProps> = ({
  onClose,
  onCallBack,
}) => {
  const { callHistory, chats } = useData();

  const getChatTitle = (chatId: string): string => {
    const chat = chats.find((c) => c.id === chatId);
    return chat?.title ?? 'Unknown';
  };

  return (
    <div className="bg-base-100 flex h-full w-full flex-col md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <FaClock className="h-4 w-4" />
        <h2 className="flex-1 font-semibold">Call History</h2>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-xs btn-ghost"
          aria-label="Close">
          <FaTimes />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {callHistory.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <FaPhone className="text-base-content/20 mb-3 h-10 w-10" />
            <p className="text-base-content/50 text-sm">No calls yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {callHistory.map((call) => (
              <div
                key={call.id}
                className="bg-base-200 flex items-center gap-3 rounded-xl p-3">
                <StatusIcon status={call.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {getChatTitle(call.chatId)}
                  </p>
                  <p className="text-base-content/40 text-xs">
                    {call.type === 'video' ? (
                      <FaVideo className="mr-1 inline h-2.5 w-2.5" />
                    ) : null}
                    {call.status === 'missed'
                      ? 'Missed'
                      : call.status === 'declined'
                        ? 'Declined'
                        : call.duration
                          ? formatDuration(call.duration)
                          : 'In progress'}
                    {' · '}
                    {formatCallTime(call.startedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCallBack(call.chatId)}
                  className="btn btn-xs btn-circle btn-ghost"
                  aria-label="Call back">
                  <FaPhone className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
