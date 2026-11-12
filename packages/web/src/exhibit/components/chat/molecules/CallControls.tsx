'use client';

import { type FC } from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaDesktop,
  FaUserPlus,
} from 'react-icons/fa';

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOff: boolean;
  isGroup: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onShareScreen?: () => void;
  onAddParticipant?: () => void;
}

export const CallControls: FC<CallControlsProps> = ({
  isMuted,
  isVideoOff,
  isSpeakerOff,
  isGroup,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
  onShareScreen,
  onAddParticipant,
}) => (
  <div className="flex items-center justify-center gap-4">
    <button
      type="button"
      onClick={onToggleMute}
      className={`btn btn-circle btn-lg ${isMuted ? 'btn-error' : 'btn-ghost'}`}
      aria-label={isMuted ? 'Unmute' : 'Mute'}>
      {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
    </button>
    <button
      type="button"
      onClick={onToggleVideo}
      className={`btn btn-circle btn-lg ${isVideoOff ? 'btn-error' : 'btn-ghost'}`}
      aria-label={isVideoOff ? 'Turn camera on' : 'Turn camera off'}>
      {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
    </button>
    <button
      type="button"
      onClick={onToggleSpeaker}
      className={`btn btn-circle btn-lg ${isSpeakerOff ? 'btn-error' : 'btn-ghost'}`}
      aria-label={isSpeakerOff ? 'Speaker on' : 'Speaker off'}>
      {isSpeakerOff ? <FaVolumeMute /> : <FaVolumeUp />}
    </button>
    {onShareScreen && (
      <button
        type="button"
        onClick={onShareScreen}
        className="btn btn-circle btn-ghost btn-lg"
        aria-label="Share screen">
        <FaDesktop />
      </button>
    )}
    {isGroup && onAddParticipant && (
      <button
        type="button"
        onClick={onAddParticipant}
        className="btn btn-circle btn-ghost btn-lg"
        aria-label="Add participant">
        <FaUserPlus />
      </button>
    )}
    <button
      type="button"
      onClick={onEndCall}
      className="btn btn-circle btn-lg btn-error"
      aria-label="End call">
      <FaPhoneSlash />
    </button>
  </div>
);
