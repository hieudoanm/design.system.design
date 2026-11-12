'use client';

import { type FC, useState, useEffect } from 'react';
import { ChatSidebar } from '@/exhibit/components/chat/organisms/ChatSidebar';
import { ChatPane } from '@/exhibit/components/chat/organisms/ChatPane';
import { NewChatModal } from '@/exhibit/components/chat/organisms/NewChatModal';
import { PinLockScreen } from '@/exhibit/components/chat/organisms/PinLockScreen';
import { IncomingCallModal } from '@/exhibit/components/chat/organisms/IncomingCallModal';
import { PairingModal } from '@/exhibit/components/chat/organisms/PairingModal';
import { useData } from '@/exhibit/providers/chat/DataProvider';

interface AppShellProps {
  selectedChatId: string | null;
  onSelectChat: (id: string | null) => void;
}

export const AppShell: FC<AppShellProps> = ({
  selectedChatId,
  onSelectChat,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pairingOpen, setPairingOpen] = useState(false);
  const {
    privacySettings,
    unlockPin,
    isLocked,
    activeCall,
    answerCall,
    declineCall,
  } = useData();
  const [showPinLock, setShowPinLock] = useState(false);

  useEffect(() => {
    if (privacySettings.pinEnabled && isLocked) {
      setShowPinLock(true);
    }
  }, [privacySettings.pinEnabled, isLocked]);

  const handleUnlock = async (pin: string): Promise<boolean> => {
    const ok = await unlockPin(pin);
    if (ok) setShowPinLock(false);
    return ok;
  };

  if (showPinLock && privacySettings.pinEnabled) {
    return <PinLockScreen onUnlock={handleUnlock} />;
  }

  const hasChat = selectedChatId !== null;

  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      <div
        className={`${hasChat ? 'hidden md:flex' : 'flex'} h-full w-full md:w-auto`}>
        <ChatSidebar
          selectedChatId={selectedChatId}
          onSelectChat={onSelectChat}
          onNewChat={() => setModalOpen(true)}
          onPairDevice={() => setPairingOpen(true)}
        />
      </div>
      <div
        className={`${hasChat ? 'flex' : 'hidden md:flex'} h-full min-w-0 flex-1`}>
        <ChatPane
          chatId={selectedChatId}
          onNewChat={() => setModalOpen(true)}
          onBack={() => onSelectChat(null)}
        />
      </div>
      <NewChatModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onChatCreated={onSelectChat}
      />
      {activeCall && activeCall.status === 'ringing' && (
        <IncomingCallModal
          call={activeCall}
          onAnswer={(callId) => {
            void answerCall(callId);
            onSelectChat(activeCall.chatId);
          }}
          onDecline={(callId) => void declineCall(callId)}
        />
      )}
      {pairingOpen && (
        <PairingModal
          onClose={() => setPairingOpen(false)}
          onPaired={(_deviceId, _peerPublicKey) => {
            setPairingOpen(false);
          }}
        />
      )}
    </div>
  );
};
