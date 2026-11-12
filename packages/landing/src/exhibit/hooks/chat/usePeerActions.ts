import { useCallback } from 'react';
import type {
  PairedDevice,
  SyncState,
  DeliveryReceipt,
  Message,
  Chat,
} from '@/exhibit/types/chat';
import { PeerConnection } from '@/exhibit/lib/chat/webrtc';

interface UsePeerActionsParams {
  setPairedDevices: React.Dispatch<React.SetStateAction<PairedDevice[]>>;
  setSyncState: React.Dispatch<React.SetStateAction<SyncState>>;
  setDeliveryReceipts: React.Dispatch<React.SetStateAction<DeliveryReceipt[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  syncState: SyncState;
  peerRef: React.RefObject<PeerConnection | null>;
}

export const usePeerActions = ({
  setPairedDevices,
  setSyncState,
  setDeliveryReceipts,
  syncState,
  peerRef,
}: UsePeerActionsParams) => {
  const syncNow = useCallback((): void => {
    setSyncState((prev) => ({
      ...prev,
      lastSyncAt: Date.now(),
      pendingSyncCount: 0,
      keyBackupVersion: prev.keyBackupVersion + 1,
    }));
    peerRef.current?.send('presence', { type: 'sync', timestamp: Date.now() });
  }, []);

  const removePairedDevice = useCallback((deviceId: string) => {
    setPairedDevices((prev) => prev.filter((d) => d.id !== deviceId));
  }, []);

  const sendPresence = useCallback((online: boolean) => {
    peerRef.current?.send('presence', {
      online,
      userId: 'me',
      timestamp: Date.now(),
    });
  }, []);

  const sendTypingOverDataChannel = useCallback(
    (chatId: string, typing: boolean) => {
      peerRef.current?.send('typing', {
        chatId,
        userId: 'me',
        typing,
        timestamp: Date.now(),
      });
    },
    []
  );

  const trackDelivery = useCallback(
    (messageId: string, status: DeliveryReceipt['status']) => {
      setDeliveryReceipts((prev) => [
        ...prev,
        {
          messageId,
          deviceId: syncState.deviceId,
          status,
          timestamp: Date.now(),
        },
      ]);
      peerRef.current?.send('receipts', {
        messageId,
        status,
        deviceId: syncState.deviceId,
      });
    },
    [syncState.deviceId]
  );

  return {
    syncNow,
    removePairedDevice,
    sendPresence,
    sendTypingOverDataChannel,
    trackDelivery,
  };
};
