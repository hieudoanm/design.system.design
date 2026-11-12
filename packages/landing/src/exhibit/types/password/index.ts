export type VaultItemType = 'login' | 'card' | 'identity' | 'note' | 'ssh';

export interface CustomField {
  key: string;
  value: string;
}

export type SharePermission = 'view' | 'edit';

export interface ShareRecipient {
  email: string;
  permission: SharePermission;
}

export interface AccessEntry {
  action: 'view' | 'copy' | 'edit' | 'create' | 'share';
  timestamp: number;
  detail?: string;
}

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  cardNumber?: string;
  cardholder?: string;
  expiry?: string;
  cvv?: string;
  totpSecret?: string;
  favorite: boolean;
  tags: string[];
  folderId?: string;
  customFields?: CustomField[];
  deletedAt?: number;
  sharedWith?: ShareRecipient[];
  sharedBy?: string;
  accessLog?: AccessEntry[];
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
}

export interface Folder {
  id: string;
  name: string;
  isTeam?: boolean;
  createdAt: number;
}

export interface EmergencyContact {
  email: string;
  delayMinutes: number;
}

export interface EmergencyAccessRequest {
  requestedAt: number;
  delayMinutes: number;
}

export interface Settings {
  theme: string;
  autoLockTimeout: number;
  clipboardClear: number;
  masterPasswordHash?: string;
  masterPasswordSalt?: string;
  biometricEnabled?: boolean;
  lockOnClose?: boolean;
  emergencyContact?: EmergencyContact;
  emergencyRequest?: EmergencyAccessRequest;
}
