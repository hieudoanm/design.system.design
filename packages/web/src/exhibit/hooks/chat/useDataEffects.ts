import { useCallback, useEffect } from 'react';
import type {
  Chat,
  Contact,
  Message,
  TypingState,
  DeliveryReceipt,
  PeerConnectionState,
  AuthSession,
  User,
  AppSettings,
  PrivacySettings,
  DeviceTrustEntry,
} from '@/exhibit/types/chat';
import { db } from '@/exhibit/lib/chat/db';
import { seedDatabase } from '@/exhibit/data/chat/seed';
import { getDeviceFingerprint } from '@/exhibit/lib/chat/crypto';
import { PeerConnection, DEFAULT_ICE_SERVERS } from '@/exhibit/lib/chat/webrtc';

interface UseDataEffectsParams {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSession: React.Dispatch<React.SetStateAction<AuthSession | null>>;
  setAccount: React.Dispatch<React.SetStateAction<User | null>>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  chats: Chat[];
  privacySettings: PrivacySettings;
  setDeviceTrustList: React.Dispatch<React.SetStateAction<DeviceTrustEntry[]>>;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useDataEffects = ({
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
}: UseDataEffectsParams) => {
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const authSession = await db.auth.get();
    setSession(authSession ?? null);
    if (!authSession) {
      setIsLoading(false);
      return;
    }
    await seedDatabase();
    const [acc, cons, chs, msgs, sett] = await Promise.all([
      db.account.get(),
      db.contacts.getAll(),
      db.chats.getAll(),
      db.messages.getAll(),
      db.settings.get(),
    ]);
    setAccount(acc ?? null);
    setContacts(cons);
    setChats(chs.sort((a, b) => b.lastMessageAt - a.lastMessageAt));
    setMessages(msgs);
    setSettings(sett);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (privacySettings.pinEnabled && privacySettings.pinHash) {
      setIsLocked(true);
    }
  }, [privacySettings.pinEnabled, privacySettings.pinHash]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => {
        const toDelete = prev.filter(
          (m) =>
            m.deletedAt === undefined &&
            m.encrypted !== true &&
            (() => {
              const chat = chats.find((c) => c.id === m.chatId);
              if (!chat) return false;
              const seconds = chat.settings.disappearingSeconds;
              if (seconds <= 0) return false;
              return now - m.createdAt > seconds * 1000;
            })()
        );
        if (toDelete.length === 0) return prev;
        return prev.map((m) => {
          if (toDelete.some((d) => d.id === m.id)) {
            void db.messages.put({ ...m, deletedAt: now });
            return { ...m, deletedAt: now };
          }
          return m;
        });
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [chats]);

  useEffect(() => {
    const fp = getDeviceFingerprint();
    const shortId = Array.from(
      new Uint8Array(new TextEncoder().encode(fp).slice(0, 8))
    )
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setDeviceTrustList((prev) => {
      if (prev.some((d) => d.deviceId === shortId)) return prev;
      return [
        ...prev,
        {
          deviceId: shortId,
          deviceLabel: navigator.userAgent.includes('Mac')
            ? 'Mac'
            : navigator.userAgent.includes('Win')
              ? 'Windows'
              : 'Device',
          publicKey: fp,
          trustedAt: Date.now(),
          verified: true,
        },
      ];
    });
  }, []);

  return refreshData;
};

interface UsePeerConnectionEffectParams {
  setPeerState: React.Dispatch<React.SetStateAction<PeerConnectionState>>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setTypingUsers: React.Dispatch<React.SetStateAction<TypingState[]>>;
  setDeliveryReceipts: React.Dispatch<React.SetStateAction<DeliveryReceipt[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  peerRef: React.RefObject<PeerConnection | null>;
}

export const usePeerConnectionEffect = ({
  setPeerState,
  setContacts,
  setTypingUsers,
  setDeliveryReceipts,
  setMessages,
  setChats,
  peerRef,
}: UsePeerConnectionEffectParams) => {
  useEffect(() => {
    const peer = new PeerConnection(DEFAULT_ICE_SERVERS);
    peerRef.current = peer;
    peer.onState((s) => setPeerState(s));
    peer.onData((msg) => {
      if (msg.channel === 'presence') {
        const payload = msg.payload as { online?: boolean; userId?: string };
        setContacts((prev) =>
          prev.map((c) =>
            c.id === payload.userId
              ? {
                  ...c,
                  online: payload.online ?? false,
                  lastSeenAt: Date.now(),
                }
              : c
          )
        );
      }
      if (msg.channel === 'typing') {
        const payload = msg.payload as {
          chatId?: string;
          userId?: string;
          typing?: boolean;
        };
        const chatId = payload.chatId;
        const userId = payload.userId;
        if (chatId && userId) {
          setTypingUsers((prev) => {
            const filtered = prev.filter(
              (t) => !(t.chatId === chatId && t.userId === userId)
            );
            if (payload.typing) {
              return [
                ...filtered,
                { chatId, userId, typing: true, timestamp: Date.now() },
              ];
            }
            return filtered;
          });
        }
      }
      if (msg.channel === 'receipts') {
        const payload = msg.payload as {
          messageId?: string;
          status?: DeliveryReceipt['status'];
          deviceId?: string;
        };
        const msgId = payload.messageId;
        const msgStatus = payload.status;
        const devId = payload.deviceId ?? 'peer';
        if (msgId && msgStatus) {
          setDeliveryReceipts((prev) => [
            ...prev.filter(
              (r) => !(r.messageId === msgId && r.deviceId === devId)
            ),
            {
              messageId: msgId,
              deviceId: devId,
              status: msgStatus,
              timestamp: Date.now(),
            },
          ]);
          if (msgStatus === 'delivered' || msgStatus === 'read') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, status: msgStatus } : m
              )
            );
          }
        }
      }
      if (msg.channel === 'messaging') {
        const payload = msg.payload as { message?: Message };
        if (payload.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message!.id)) return prev;
            return [...prev, payload.message!];
          });
          setChats((prev) =>
            prev.map((c) =>
              c.id === payload.message!.chatId
                ? {
                    ...c,
                    lastMessageAt: payload.message!.createdAt,
                    unreadCount:
                      c.id === payload.message!.chatId
                        ? c.unreadCount + 1
                        : c.unreadCount,
                  }
                : c
            )
          );
        }
      }
    });
    return () => peer.close();
  }, []);
};
