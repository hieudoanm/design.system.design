import { useCallback, useState } from 'react';
import type { Chat, Contact, User, Call, CallType } from '@/exhibit/types/chat';
import { db } from '@/exhibit/lib/chat/db';
import { generateId } from '@/exhibit/data/chat/seed';
import { OTHER, getOtherParticipantId } from '@/exhibit/providers/chat/data-helpers';

const generateMockQuality = (): {
  bitrate: number;
  latency: number;
  packetLoss: number;
} => ({
  bitrate: Math.floor(Math.random() * 400) + 100,
  latency: Math.floor(Math.random() * 50) + 10,
  packetLoss: Math.round(Math.random() * 2 * 100) / 100,
});

interface UseCallActionsParams {
  chats: Chat[];
  contacts: Contact[];
  account: User | null;
  setCallHistory: React.Dispatch<React.SetStateAction<Call[]>>;
  setActiveCall: React.Dispatch<React.SetStateAction<Call | null>>;
}

export const useCallActions = ({
  chats,
  contacts,
  account,
  setCallHistory,
  setActiveCall,
}: UseCallActionsParams) => {
  const [callMuted, setCallMuted] = useState(false);
  const [callVideoOff, setCallVideoOff] = useState(false);
  const [callSpeakerOff, setCallSpeakerOff] = useState(false);

  const startCall = useCallback(
    async (chatId: string, type: CallType): Promise<void> => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;
      const otherId = getOtherParticipantId(chat);
      const contact = otherId
        ? contacts.find((c) => c.id === otherId)
        : undefined;
      const participants = [
        {
          userId: OTHER,
          name: account?.name ?? 'You',
          avatarColor: account?.avatarColor ?? '#ff0030',
          audioMuted: false,
          videoOff: type === 'voice',
          joinedAt: Date.now(),
        },
      ];
      if (contact) {
        participants.push({
          userId: contact.id,
          name: contact.name,
          avatarColor: contact.avatarColor,
          audioMuted: false,
          videoOff: type === 'voice',
          joinedAt: Date.now(),
        });
      }
      const call: Call = {
        id: generateId(),
        chatId,
        type,
        status: 'active',
        participants,
        startedAt: Date.now(),
        quality: generateMockQuality(),
        isGroup: chat.kind === 'group',
      };
      setActiveCall(call);
      setCallHistory((prev) => [call, ...prev]);
      void db.messages.put({
        id: generateId(),
        chatId,
        authorId: OTHER,
        type: 'system',
        text: `You started a ${type} call`,
        status: 'read',
        createdAt: Date.now(),
        reactions: [],
      });
    },
    [chats, contacts, account]
  );

  const answerCall = useCallback(async (callId: string): Promise<void> => {
    setCallHistory((prev) =>
      prev.map((c) =>
        c.id === callId ? { ...c, status: 'active' as const } : c
      )
    );
    setActiveCall((prev) =>
      prev && prev.id === callId ? { ...prev, status: 'active' } : prev
    );
  }, []);

  const endCall = useCallback(async (): Promise<void> => {
    setActiveCall((currentCall) => {
      if (!currentCall) return currentCall;
      const ended = {
        ...currentCall,
        status: 'ended' as const,
        endedAt: Date.now(),
        duration: Math.floor((Date.now() - currentCall.startedAt) / 1000),
        quality: generateMockQuality(),
      };
      setCallHistory((prev) =>
        prev.map((c) => (c.id === ended.id ? ended : c))
      );
      void db.messages.put({
        id: generateId(),
        chatId: ended.chatId,
        authorId: OTHER,
        type: 'system',
        text: `Call ended · ${ended.duration ?? 0}s`,
        status: 'read',
        createdAt: Date.now(),
        reactions: [],
      });
      return null;
    });
  }, []);

  const declineCall = useCallback(async (callId: string): Promise<void> => {
    setCallHistory((prev) =>
      prev.map((c) =>
        c.id === callId
          ? { ...c, status: 'declined' as const, endedAt: Date.now() }
          : c
      )
    );
    setActiveCall((prev) => (prev?.id === callId ? null : prev));
  }, []);

  const toggleCallMute = useCallback(() => {
    setCallMuted((prev) => !prev);
    setActiveCall((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map((p) =>
          p.userId === OTHER ? { ...p, audioMuted: !p.audioMuted } : p
        ),
      };
    });
  }, []);

  const toggleCallVideo = useCallback(() => {
    setCallVideoOff((prev) => !prev);
    setActiveCall((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map((p) =>
          p.userId === OTHER ? { ...p, videoOff: !p.videoOff } : p
        ),
      };
    });
  }, []);

  const toggleCallSpeaker = useCallback(() => {
    setCallSpeakerOff((prev) => !prev);
  }, []);

  const shareScreen = useCallback(async (): Promise<void> => {
    try {
      await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch {
      // user cancelled or unsupported
    }
  }, []);

  return {
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
  };
};
