import type { DeliveryStatus } from './message';

export type PeerConnectionState =
  'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

export interface PairedDevice {
  id: string;
  label: string;
  publicKey: string;
  pairedAt: number;
  lastSeenAt: number;
  online: boolean;
}

export interface DeliveryReceipt {
  messageId: string;
  deviceId: string;
  status: DeliveryStatus;
  timestamp: number;
}

export interface SyncState {
  lastSyncAt: number;
  deviceId: string;
  keyBackupVersion: number;
  pendingSyncCount: number;
}
