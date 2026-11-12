export interface AppSettings {
  id: string;
  theme: string;
  notifications: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
  disappearingSeconds: number;
}

export interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typingIndicators: boolean;
  groupsInvite: 'everyone' | 'contacts' | 'nobody';
  blockedContactIds: string[];
  pinEnabled: boolean;
  pinHash: string;
}

export interface SpamReport {
  contactId: string;
  reason: string;
  reportedAt: number;
}

export interface TypingState {
  chatId: string;
  userId: string;
  typing: boolean;
  timestamp: number;
}

export interface DeviceKeyPair {
  id: string;
  publicKey: string;
  privateKey: string;
  createdAt: number;
  deviceLabel: string;
  trusted: boolean;
}

export interface DeviceTrustEntry {
  deviceId: string;
  deviceLabel: string;
  publicKey: string;
  trustedAt: number;
  verified: boolean;
}

export interface VerificationCode {
  chatId: string;
  code: string;
  createdAt: number;
  expiresAt: number;
}
