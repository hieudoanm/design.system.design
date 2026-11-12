'use client';

import { type FC, useEffect, useState, useRef } from 'react';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import { CallControls } from '@/exhibit/components/chat/molecules/CallControls';
import type { Call } from '@/exhibit/types/chat';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface CallScreenProps {
  call: Call;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onShareScreen?: () => void;
}

export const CallScreen: FC<CallScreenProps> = ({
  call,
  isMuted,
  isVideoOff,
  isSpeakerOff,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
  onShareScreen,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [quality, setQuality] = useState(call.quality);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - call.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [call.startedAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuality({
        bitrate: Math.floor(Math.random() * 400) + 100,
        latency: Math.floor(Math.random() * 50) + 10,
        packetLoss: Math.round(Math.random() * 2 * 100) / 100,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (call.type === 'video' && !isVideoOff) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {});
    }
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [call.type, isVideoOff]);

  const remote = call.participants.find((p) => p.userId !== 'me');
  const isVideo = call.type === 'video' && !isVideoOff;

  return (
    <div className="bg-base-300 fixed inset-0 z-50 flex flex-col items-center justify-between p-6">
      {isVideo && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="bg-base-100/80 absolute right-4 bottom-24 h-32 w-24 overflow-hidden rounded-xl">
            {localStream && (
              <video
                autoPlay
                muted
                playsInline
                className="h-full w-full scale-x-[-1] object-cover"
                ref={(el) => {
                  if (el && localStream) el.srcObject = localStream;
                }}
              />
            )}
          </div>
        </div>
      )}
      <div className="relative z-10 flex flex-col items-center">
        {remote && (
          <Avatar name={remote.name} color={remote.avatarColor} size="lg" />
        )}
        <h2 className="mt-3 text-xl font-bold text-white">
          {remote?.name ?? 'Unknown'}
        </h2>
        <p className="text-sm text-white/60">{formatDuration(elapsed)}</p>
        {quality && (
          <div className="mt-2 flex gap-3 text-[10px] text-white/40">
            <span>{quality.bitrate} kbps</span>
            <span>{quality.latency}ms</span>
            <span>{quality.packetLoss}% loss</span>
          </div>
        )}
      </div>
      <div className="relative z-10">
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isSpeakerOff={isSpeakerOff}
          isGroup={call.isGroup}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onToggleSpeaker={onToggleSpeaker}
          onEndCall={onEndCall}
          onShareScreen={onShareScreen}
        />
      </div>
    </div>
  );
};
