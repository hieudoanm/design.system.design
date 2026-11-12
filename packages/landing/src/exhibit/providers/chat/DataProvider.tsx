'use client';

import { useState, useRef, type ReactNode } from 'react';
import type {
  User,
  Contact,
  Chat,
  Message,
  AppSettings,
  AuthSession,
  TypingState,
  UploadProgress,
  PrivacySettings,
  DeviceTrustEntry,
  VerificationCode,
  SpamReport,
  Call,
  PairedDevice,
  SyncState,
  DeliveryReceipt,
  PeerConnectionState,
} from '@/exhibit/types/chat';
import { PeerConnection, generateDeviceId } from '@/exhibit/lib/chat/webrtc';
import { DataContext } from '@/exhibit/providers/chat/DataContext';
import { DEFAULT_SETTINGS } from '@/exhibit/providers/chat/data-helpers';
import {
  useDataEffects,
  usePeerConnectionEffect,
} from '@/exhibit/hooks/chat/useDataEffects';
import { useAuthActions } from '@/exhibit/hooks/chat/useAuthActions';
import { useMessageActions } from '@/exhibit/hooks/chat/useMessageActions';
import { useChatActions } from '@/exhibit/hooks/chat/useChatActions';
import { useSettingsActions } from '@/exhibit/hooks/chat/useSettingsActions';
import { usePrivacyActions } from '@/exhibit/hooks/chat/usePrivacyActions';
import { useCallActions } from '@/exhibit/hooks/chat/useCallActions';
import { usePeerActions } from '@/exhibit/hooks/chat/usePeerActions';

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [account, setAccount] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingState[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Map<string, UploadProgress>
  >(new Map());
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    readReceipts: true,
    typingIndicators: true,
    groupsInvite: 'everyone',
    blockedContactIds: [],
    pinEnabled: false,
    pinHash: '',
  });
  const [deviceTrustList, setDeviceTrustList] = useState<DeviceTrustEntry[]>(
    []
  );
  const [activeVerification, setActiveVerification] =
    useState<VerificationCode | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [spamReports, setSpamReports] = useState<SpamReport[]>([]);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  const [peerState, setPeerState] = useState<PeerConnectionState>('new');
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    lastSyncAt: Date.now(),
    deviceId: generateDeviceId(),
    keyBackupVersion: 1,
    pendingSyncCount: 0,
  });
  const [deliveryReceipts, setDeliveryReceipts] = useState<DeliveryReceipt[]>(
    []
  );
  const peerRef = useRef<PeerConnection | null>(null);

  const refreshData = useDataEffects({
    setIsLoading,
    setSession,
    setAccount,
    setContacts,
    setChats,
    setMessages,
    setSettings,
    chats,
    privacySettings,
    setDeviceTrustList,
    setIsLocked,
  });

  usePeerConnectionEffect({
    setPeerState,
    setContacts,
    setTypingUsers,
    setDeliveryReceipts,
    setMessages,
    setChats,
    peerRef,
  });

  const { signUp, signIn, signOut } = useAuthActions({
    refreshData,
    setAccount,
    setSession,
    setContacts: setContacts as React.Dispatch<React.SetStateAction<never[]>>,
    setChats: setChats as React.Dispatch<React.SetStateAction<never[]>>,
    setMessages: setMessages as React.Dispatch<React.SetStateAction<never[]>>,
  });

  const {
    sendMessage,
    addReaction,
    deleteMessage,
    deleteForEveryone,
    editMessage,
    forwardMessage,
    forwardToMultiple,
    sendMediaMessage,
    sendSticker,
    getMediaMessages,
    updateUploadProgress,
  } = useMessageActions({
    messages,
    setMessages,
    chats,
    setChats,
    contacts,
    privacySettings,
    uploadProgress,
    setUploadProgress,
  });

  const {
    markChatRead,
    togglePin,
    toggleMute,
    toggleSecret,
    createChat,
    createGroup,
    promoteAdmin,
    demoteAdmin,
    addGroupMember,
    removeGroupMember,
    setTyping,
    updateChatSettings,
  } = useChatActions({
    chats,
    setChats,
    contacts,
    typingUsers,
    setTypingUsers,
  });

  const { updateAccount, updateSettings } = useSettingsActions({
    account,
    setAccount,
    setSettings,
  });

  const {
    updatePrivacySettings,
    blockContact,
    unblockContact,
    reportSpam,
    addTrustedDevice,
    removeTrustedDevice,
    verifyDevice,
    startVerification,
    clearVerification,
    isPinValid,
    setPin,
    unlockPin,
  } = usePrivacyActions({
    privacySettings,
    setPrivacySettings,
    setContacts,
    setSpamReports,
    setDeviceTrustList,
    setActiveVerification,
    setIsLocked,
  });

  const {
    startCall,
    answerCall,
    endCall,
    declineCall,
    toggleCallMute,
    toggleCallVideo,
    toggleCallSpeaker,
    shareScreen,
    callMuted,
    callVideoOff,
    callSpeakerOff,
  } = useCallActions({
    chats,
    contacts,
    account,
    setCallHistory,
    setActiveCall,
  });

  const {
    syncNow,
    removePairedDevice,
    sendPresence,
    sendTypingOverDataChannel,
    trackDelivery,
  } = usePeerActions({
    setPairedDevices,
    setSyncState,
    setDeliveryReceipts,
    setMessages,
    setChats,
    syncState,
    peerRef,
  });

  return (
    <DataContext.Provider
      value={{
        account,
        contacts,
        chats,
        messages,
        settings,
        session,
        isLoading,
        typingUsers,
        refreshData,
        signUp,
        signIn,
        signOut,
        sendMessage,
        addReaction,
        deleteMessage,
        deleteForEveryone,
        editMessage,
        forwardMessage,
        markChatRead,
        togglePin,
        toggleMute,
        toggleSecret,
        createChat,
        createGroup,
        updateAccount,
        updateSettings,
        promoteAdmin,
        demoteAdmin,
        addGroupMember,
        removeGroupMember,
        setTyping,
        updateChatSettings,
        sendMediaMessage,
        sendSticker,
        updateUploadProgress,
        getMediaMessages,
        forwardToMultiple,
        privacySettings,
        updatePrivacySettings,
        blockContact,
        unblockContact,
        reportSpam,
        deviceTrustList,
        addTrustedDevice,
        removeTrustedDevice,
        verifyDevice,
        activeVerification,
        startVerification,
        clearVerification,
        isPinValid,
        setPin,
        unlockPin,
        isLocked,
        spamReports,
        callHistory,
        activeCall,
        startCall,
        answerCall,
        endCall,
        declineCall,
        toggleCallMute,
        toggleCallVideo,
        toggleCallSpeaker,
        shareScreen,
        callMuted,
        callVideoOff,
        callSpeakerOff,
        peerState,
        pairedDevices,
        syncState,
        deliveryReceipts,
        syncNow,
        removePairedDevice,
        sendPresence,
        sendTypingOverDataChannel,
        trackDelivery,
      }}>
      {children}
    </DataContext.Provider>
  );
};

export { useData } from '@/exhibit/providers/chat/DataContext';
export { REPLY_POOL } from '@/exhibit/providers/chat/data-helpers';
export { getOtherParticipantId } from '@/exhibit/providers/chat/data-helpers';
