'use client';

import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { useToast } from '@/exhibit/providers/chat/ToastProvider';
import { ChatHeader } from '@/exhibit/components/chat/molecules/ChatHeader';
import { Composer } from '@/exhibit/components/chat/molecules/Composer';
import { ReplyComposer } from '@/exhibit/components/chat/molecules/ReplyComposer';
import { ChatSearchBar } from '@/exhibit/components/chat/molecules/ChatSearchBar';
import { TypingIndicator } from '@/exhibit/components/chat/atoms/TypingIndicator';
import { EmptyState } from '@/exhibit/components/chat/atoms/EmptyState';
import { MediaComposer } from '@/exhibit/components/chat/molecules/MediaComposer';
import { VoiceRecorder } from '@/exhibit/components/chat/molecules/VoiceRecorder';
import { StickerPicker } from '@/exhibit/components/chat/molecules/StickerPicker';
import { ImageLightbox } from '@/exhibit/components/chat/organisms/ImageLightbox';
import { MediaGallery } from '@/exhibit/components/chat/organisms/MediaGallery';
import { ForwardModal } from '@/exhibit/components/chat/organisms/ForwardModal';
import { ChatSettingsPanel } from '@/exhibit/components/chat/organisms/ChatSettingsPanel';
import { GroupAdminPanel } from '@/exhibit/components/chat/organisms/GroupAdminPanel';
import { SecretChatBanner } from '@/exhibit/components/chat/molecules/SecretChatBanner';
import { VerificationCodeModal } from '@/exhibit/components/chat/molecules/VerificationCodeModal';
import { CallScreen } from '@/exhibit/components/chat/organisms/CallScreen';
import { GroupCallView } from '@/exhibit/components/chat/organisms/GroupCallView';
import { getChatMessages } from '@/exhibit/lib/chat/selectors';
import { searchMessages } from '@/exhibit/lib/chat/format';
import type { Message } from '@/exhibit/types/chat';
import { useChatPaneHandlers } from './ChatPane/useChatPaneHandlers';
import { MessageList } from './ChatPane/MessageList';

interface ChatPaneProps {
  chatId: string | null;
  onNewChat: () => void;
  onBack?: () => void;
}

export const ChatPane: FC<ChatPaneProps> = ({ chatId, onNewChat, onBack }) => {
  const {
    chats,
    contacts,
    messages,
    typingUsers,
    activeVerification,
    clearVerification,
    privacySettings,
    activeCall,
    toggleCallMute,
    toggleCallVideo,
    toggleCallSpeaker,
    shareScreen,
    callMuted,
    callVideoOff,
    callSpeakerOff,
    markChatRead,
  } = useData();
  const { showToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showGroupAdmin, setShowGroupAdmin] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [forwardMessageId, setForwardMessageId] = useState<string | null>(null);

  const chat = chats.find((c) => c.id === chatId) ?? null;
  const chatMessages = useMemo(
    () => (chatId ? getChatMessages(messages, chatId) : []),
    [messages, chatId]
  );

  const searchResults = useMemo(
    () => searchMessages(chatMessages, searchQuery),
    [chatMessages, searchQuery]
  );

  const highlightedIds = useMemo(
    () => new Set(searchResults.map((m) => m.id)),
    [searchResults]
  );

  const otherContact = chat
    ? contacts.find((c) => chat.memberIds.includes(c.id))
    : undefined;

  const chatTypingNames = useMemo(() => {
    if (!chat) return [];
    return typingUsers
      .filter(
        (t) =>
          t.chatId === chat.id &&
          t.typing &&
          t.userId !== 'me' &&
          Date.now() - t.timestamp < 5000
      )
      .map((t) => contacts.find((c) => c.id === t.userId)?.name ?? 'Someone');
  }, [typingUsers, chat, contacts]);

  const {
    handleSend,
    handleReact,
    handleCopy,
    handleForward,
    handleEdit,
    handleDelete,
    handleDeleteForEveryone,
    handleVerify,
    handleImageSelect,
    handleVideoSelect,
    handleFileSelect,
    handleVoiceSend,
    handleStickerSelect,
    handleVoiceCall,
    handleVideoCall,
    handleEndCall,
    handleImageClick,
    scrollToBottom,
  } = useChatPaneHandlers({
    chat,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    setShowVoiceRecorder,
    setShowStickerPicker,
    setLightboxImages,
    setLightboxIndex,
    setForwardMessageId,
    chatMessages,
    scrollRef,
  });

  useEffect(() => {
    if (chatId) {
      void markChatRead(chatId);
    }
  }, [chatId, chatMessages.length, markChatRead]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, scrollToBottom]);

  useEffect(() => {
    setSearchQuery('');
    setSearchIndex(0);
    setReplyingTo(null);
    setEditingMessage(null);
    setShowSettings(false);
    setShowGroupAdmin(false);
    setShowVoiceRecorder(false);
    setShowStickerPicker(false);
    setShowMediaGallery(false);
    setLightboxImages(null);
    setForwardMessageId(null);
  }, [chatId]);

  useEffect(() => {
    if (
      searchResults.length > 0 &&
      searchIndex >= 0 &&
      searchIndex < searchResults.length
    ) {
      const el = document.getElementById(
        `message-${searchResults[searchIndex].id}`
      );
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchIndex, searchResults]);

  useEffect(() => {
    if (!chat?.isSecret) return;
    const handler = (): void => {
      if (document.visibilityState === 'hidden') {
        showToast('Screenshot detected in secret chat', 'error');
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [chat?.isSecret, showToast]);

  if (!chat) {
    return (
      <section className="bg-base-200/40 flex h-full flex-1 flex-col items-center justify-center">
        <EmptyState
          icon={FaLock}
          title="Select a chat"
          description="Choose a conversation from the list or start a new one."
        />
      </section>
    );
  }

  let lastDay = '';
  const grouped = chatMessages.map((message) => {
    const day = new Date(message.createdAt).toDateString();
    const isNewDay = day !== lastDay;
    lastDay = day;
    return { message, isNewDay };
  });

  return (
    <section className="bg-base-200/40 flex h-full min-w-0 flex-1 flex-col">
      <ChatHeader
        title={chat.title}
        avatarColor={chat.avatarColor}
        kind={chat.kind}
        online={otherContact?.online ?? false}
        lastSeenAt={otherContact?.lastSeenAt ?? Date.now()}
        memberCount={chat.memberIds.length}
        muted={chat.muted}
        secret={chat.isSecret}
        lastSeenVisibility={privacySettings.lastSeen}
        profilePhotoVisibility={privacySettings.profilePhoto}
        onNewChat={onNewChat}
        onBack={onBack}
        onSearch={() => {
          setShowSettings(false);
          setShowGroupAdmin(false);
          setSearchQuery(searchQuery === '' ? ' ' : searchQuery);
        }}
        onGroupAdmin={
          chat.kind === 'group'
            ? () => {
                setShowSettings(false);
                setShowGroupAdmin(!showGroupAdmin);
              }
            : undefined
        }
        onSettings={() => {
          setShowGroupAdmin(false);
          setShowSettings(!showSettings);
        }}
        onMediaGallery={() => {
          setShowSettings(false);
          setShowGroupAdmin(false);
          setShowMediaGallery(!showMediaGallery);
        }}
        onVoiceCall={handleVoiceCall}
        onVideoCall={handleVideoCall}
      />
      {searchQuery.trim() !== '' && (
        <ChatSearchBar
          query={searchQuery}
          onChange={(q) => {
            setSearchQuery(q);
            setSearchIndex(0);
          }}
          resultCount={searchResults.length}
          currentIndex={searchIndex}
          onPrev={() =>
            setSearchIndex(
              searchResults.length > 0
                ? (searchIndex - 1 + searchResults.length) %
                    searchResults.length
                : 0
            )
          }
          onNext={() =>
            setSearchIndex(
              searchResults.length > 0
                ? (searchIndex + 1) % searchResults.length
                : 0
            )
          }
        />
      )}
      {chat.isSecret && <SecretChatBanner onVerify={handleVerify} />}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            <MessageList
              grouped={grouped}
              contacts={contacts}
              messages={messages}
              highlightedIds={highlightedIds}
              searchQuery={searchQuery}
              onReact={handleReact}
              onReply={(message) => {
                setReplyingTo(message);
                setEditingMessage(null);
              }}
              onCopy={handleCopy}
              onForward={handleForward}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteForEveryone={handleDeleteForEveryone}
              onImageClick={handleImageClick}
              chatId={chat.id}
            />
          </div>
          <TypingIndicator names={chatTypingNames} />
          {editingMessage && (
            <div className="bg-base-200/60 border-base-300 flex items-center gap-2 border-t px-3 py-1.5 text-xs">
              <span className="text-base-content/50">
                Editing: {editingMessage.text.slice(0, 40)}…
              </span>
              <button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="btn btn-xs btn-ghost text-error">
                Cancel
              </button>
            </div>
          )}
          {replyingTo && (
            <ReplyComposer
              replyingTo={replyingTo}
              authorName={
                replyingTo.authorId === 'me'
                  ? 'You'
                  : contacts.find((c) => c.id === replyingTo.authorId)?.name
              }
              onSend={handleSend}
              onCancel={() => setReplyingTo(null)}
            />
          )}
          {showVoiceRecorder ? (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <div className="border-base-300 bg-base-100 flex items-end gap-2 border-t p-3">
              <MediaComposer
                onImageSelect={handleImageSelect}
                onVideoSelect={handleVideoSelect}
                onFileSelect={handleFileSelect}
                onVoiceRecord={() => setShowVoiceRecorder(true)}
                onStickerToggle={() => setShowStickerPicker(!showStickerPicker)}
              />
              <div className="relative flex-1">
                {showStickerPicker && (
                  <StickerPicker
                    onSelect={handleStickerSelect}
                    onClose={() => setShowStickerPicker(false)}
                  />
                )}
                <Composer onSend={handleSend} incognito={chat.isSecret} />
              </div>
            </div>
          )}
        </div>
        {showSettings && (
          <ChatSettingsPanel
            chat={chat}
            onClose={() => setShowSettings(false)}
          />
        )}
        {showGroupAdmin && chat.kind === 'group' && (
          <GroupAdminPanel
            chat={chat}
            onClose={() => setShowGroupAdmin(false)}
          />
        )}
        {showMediaGallery && (
          <MediaGallery
            chatId={chat.id}
            onClose={() => setShowMediaGallery(false)}
          />
        )}
      </div>
      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages(null)}
        />
      )}
      {forwardMessageId && (
        <ForwardModal
          messageId={forwardMessageId}
          onClose={() => setForwardMessageId(null)}
        />
      )}
      {activeVerification && activeVerification.chatId === chat.id && (
        <VerificationCodeModal
          verification={activeVerification}
          onClose={clearVerification}
        />
      )}
      {activeCall && activeCall.chatId === chat.id && activeCall.isGroup && (
        <GroupCallView
          call={activeCall}
          isMuted={callMuted}
          isVideoOff={callVideoOff}
          isSpeakerOff={callSpeakerOff}
          onToggleMute={toggleCallMute}
          onToggleVideo={toggleCallVideo}
          onToggleSpeaker={toggleCallSpeaker}
          onEndCall={handleEndCall}
          onShareScreen={shareScreen}
        />
      )}
      {activeCall && activeCall.chatId === chat.id && !activeCall.isGroup && (
        <CallScreen
          call={activeCall}
          isMuted={callMuted}
          isVideoOff={callVideoOff}
          isSpeakerOff={callSpeakerOff}
          onToggleMute={toggleCallMute}
          onToggleVideo={toggleCallVideo}
          onToggleSpeaker={toggleCallSpeaker}
          onEndCall={handleEndCall}
          onShareScreen={shareScreen}
        />
      )}
    </section>
  );
};
