import { createContext, useContext } from 'react';
import type {
  User,
  Contact,
  Chat,
  Message,
  AppSettings,
  AuthSession,
  AuthMethod,
  TypingState,
  MediaAttachment,
  UploadProgress,
  PrivacySettings,
  DeviceTrustEntry,
  VerificationCode,
  SpamReport,
  Call,
  CallType,
  PairedDevice,
  SyncState,
  DeliveryReceipt,
  PeerConnectionState,
} from '@/exhibit/types/chat';

export interface DataContextType {
  account: User | null;
  contacts: Contact[];
  chats: Chat[];
  messages: Message[];
  settings: AppSettings;
  session: AuthSession | null;
  isLoading: boolean;
  typingUsers: TypingState[];

  refreshData: () => Promise<void>;
  signUp: (name: string, phone: string, username: string) => Promise<void>;
  signIn: (method: AuthMethod, identifier: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendMessage: (
    chatId: string,
    text: string,
    replyToId?: string
  ) => Promise<Message>;
  addReaction: (
    chatId: string,
    messageId: string,
    emoji: string
  ) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  deleteForEveryone: (chatId: string, messageId: string) => Promise<void>;
  editMessage: (
    chatId: string,
    messageId: string,
    text: string
  ) => Promise<void>;
  forwardMessage: (messageId: string, targetChatId: string) => Promise<void>;
  markChatRead: (chatId: string) => Promise<void>;
  togglePin: (chatId: string) => Promise<void>;
  toggleMute: (chatId: string) => Promise<void>;
  toggleSecret: (chatId: string) => Promise<void>;
  createChat: (contactId: string) => Promise<Chat>;
  createGroup: (title: string, memberIds: string[]) => Promise<Chat>;
  updateAccount: (partial: Partial<User>) => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  promoteAdmin: (chatId: string, userId: string) => Promise<void>;
  demoteAdmin: (chatId: string, userId: string) => Promise<void>;
  addGroupMember: (chatId: string, userId: string) => Promise<void>;
  removeGroupMember: (chatId: string, userId: string) => Promise<void>;
  setTyping: (chatId: string, typing: boolean) => void;
  updateChatSettings: (
    chatId: string,
    partial: Partial<Chat['settings']>
  ) => Promise<void>;
  sendMediaMessage: (
    chatId: string,
    attachment: MediaAttachment,
    caption: string
  ) => Promise<Message>;
  sendSticker: (chatId: string, stickerUrl: string) => Promise<Message>;
  updateUploadProgress: (messageId: string, progress: UploadProgress) => void;
  getMediaMessages: (chatId: string) => Message[];
  forwardToMultiple: (
    messageId: string,
    targetChatIds: string[]
  ) => Promise<void>;

  privacySettings: PrivacySettings;
  updatePrivacySettings: (partial: Partial<PrivacySettings>) => Promise<void>;
  blockContact: (contactId: string) => Promise<void>;
  unblockContact: (contactId: string) => Promise<void>;
  reportSpam: (contactId: string, reason: string) => Promise<void>;
  deviceTrustList: DeviceTrustEntry[];
  addTrustedDevice: (
    device: Omit<DeviceTrustEntry, 'trustedAt'>
  ) => Promise<void>;
  removeTrustedDevice: (deviceId: string) => Promise<void>;
  verifyDevice: (deviceId: string) => Promise<void>;
  activeVerification: VerificationCode | null;
  startVerification: (chatId: string) => Promise<VerificationCode>;
  clearVerification: () => void;
  isPinValid: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  unlockPin: (pin: string) => Promise<boolean>;
  isLocked: boolean;
  spamReports: SpamReport[];

  callHistory: Call[];
  activeCall: Call | null;
  startCall: (chatId: string, type: CallType) => Promise<void>;
  answerCall: (callId: string) => Promise<void>;
  endCall: () => Promise<void>;
  declineCall: (callId: string) => Promise<void>;
  toggleCallMute: () => void;
  toggleCallVideo: () => void;
  toggleCallSpeaker: () => void;
  shareScreen: () => Promise<void>;
  callMuted: boolean;
  callVideoOff: boolean;
  callSpeakerOff: boolean;

  peerState: PeerConnectionState;
  pairedDevices: PairedDevice[];
  syncState: SyncState;
  deliveryReceipts: DeliveryReceipt[];
  syncNow: () => void;
  removePairedDevice: (deviceId: string) => void;
  sendPresence: (online: boolean) => void;
  sendTypingOverDataChannel: (chatId: string, typing: boolean) => void;
  trackDelivery: (messageId: string, status: DeliveryReceipt['status']) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export { DataContext };
