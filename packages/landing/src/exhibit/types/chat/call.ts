export type CallStatus = 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
export type CallType = 'voice' | 'video';

export interface CallParticipant {
  userId: string;
  name: string;
  avatarColor: string;
  audioMuted: boolean;
  videoOff: boolean;
  joinedAt: number;
}

export interface CallQuality {
  bitrate: number;
  latency: number;
  packetLoss: number;
}

export interface Call {
  id: string;
  chatId: string;
  type: CallType;
  status: CallStatus;
  participants: CallParticipant[];
  startedAt: number;
  endedAt?: number;
  duration?: number;
  quality?: CallQuality;
  isGroup: boolean;
}
