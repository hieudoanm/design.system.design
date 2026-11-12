'use client';

import { type FC, useEffect, useState } from 'react';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import { CallControls } from '@/exhibit/components/chat/molecules/CallControls';
import type { Call, CallParticipant } from '@/exhibit/types/chat';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface GroupCallViewProps {
  call: Call;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onShareScreen?: () => void;
  onAddParticipant?: () => void;
}

const ParticipantTile: FC<{ participant: CallParticipant }> = ({
  participant,
}) => (
  <div className="bg-base-200 relative flex flex-col items-center justify-center rounded-xl p-4">
    <Avatar name={participant.name} color={participant.avatarColor} size="md" />
    <p className="mt-2 truncate text-xs font-medium">{participant.name}</p>
    {participant.audioMuted && (
      <span className="text-error text-[10px]">Muted</span>
    )}
    {participant.videoOff && (
      <span className="text-base-content/40 text-[10px]">Camera off</span>
    )}
  </div>
);

export const GroupCallView: FC<GroupCallViewProps> = ({
  call,
  isMuted,
  isVideoOff,
  isSpeakerOff,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
  onShareScreen,
  onAddParticipant,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - call.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [call.startedAt]);

  return (
    <div className="bg-base-300 fixed inset-0 z-50 flex flex-col p-6">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold">Group Call</h2>
        <p className="text-base-content/60 text-sm">
          {call.participants.length} participants · {formatDuration(elapsed)}
        </p>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3">
        {call.participants.map((p) => (
          <ParticipantTile key={p.userId} participant={p} />
        ))}
      </div>
      <div className="mt-4">
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isSpeakerOff={isSpeakerOff}
          isGroup
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onToggleSpeaker={onToggleSpeaker}
          onEndCall={onEndCall}
          onShareScreen={onShareScreen}
          onAddParticipant={onAddParticipant}
        />
      </div>
    </div>
  );
};
