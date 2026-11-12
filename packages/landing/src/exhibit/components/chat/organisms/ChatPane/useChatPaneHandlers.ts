'use client';

import { useCallback, type RefObject } from 'react';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { useToast } from '@/exhibit/providers/chat/ToastProvider';
import type { Message, MediaAttachment } from '@/exhibit/types/chat';

interface UseChatPaneHandlersParams {
  chat: ReturnType<typeof useData>['chats'][number] | null;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (msg: Message | null) => void;
  setShowVoiceRecorder: (show: boolean) => void;
  setShowStickerPicker: (show: boolean) => void;
  setLightboxImages: (images: string[] | null) => void;
  setLightboxIndex: (index: number) => void;
  setForwardMessageId: (id: string | null) => void;
  chatMessages: Message[];
  scrollRef: RefObject<HTMLDivElement | null>;
}

export const useChatPaneHandlers = ({
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
}: UseChatPaneHandlersParams) => {
  const {
    sendMessage,
    addReaction,
    deleteMessage,
    deleteForEveryone,
    editMessage,
    sendMediaMessage,
    sendSticker,
    startCall,
    endCall,
    startVerification,
  } = useData();
  const { showToast } = useToast();

  const handleSend = useCallback(
    (text: string): void => {
      if (!chat) return;
      if (editingMessage) {
        void editMessage(chat.id, editingMessage.id, text);
        setEditingMessage(null);
        showToast('Message edited', 'info');
        return;
      }
      const replyToId = replyingTo?.id;
      void sendMessage(chat.id, text, replyToId);
      setReplyingTo(null);
    },
    [
      chat,
      editingMessage,
      replyingTo,
      editMessage,
      sendMessage,
      showToast,
      setEditingMessage,
      setReplyingTo,
    ]
  );

  const handleReact = useCallback(
    (messageId: string, emoji: string): void => {
      if (!chat) return;
      void addReaction(chat.id, messageId, emoji);
    },
    [chat, addReaction]
  );

  const handleCopy = useCallback(
    (text: string): void => {
      void navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'info');
    },
    [showToast]
  );

  const handleForward = useCallback(
    (message: Message): void => {
      setForwardMessageId(message.id);
    },
    [setForwardMessageId]
  );

  const handleEdit = useCallback(
    (message: Message): void => {
      setEditingMessage(message);
      setReplyingTo(null);
    },
    [setEditingMessage, setReplyingTo]
  );

  const handleDelete = useCallback(
    (chatId: string, messageId: string): void => {
      void deleteMessage(chatId, messageId);
      showToast('Message deleted', 'info');
    },
    [deleteMessage, showToast]
  );

  const handleDeleteForEveryone = useCallback(
    (chatId: string, messageId: string): void => {
      void deleteForEveryone(chatId, messageId);
      showToast('Message deleted for everyone', 'info');
    },
    [deleteForEveryone, showToast]
  );

  const handleVerify = useCallback(async (): Promise<void> => {
    if (!chat) return;
    await startVerification(chat.id);
  }, [chat, startVerification]);

  const handleImageSelect = useCallback(
    async (file: File): Promise<void> => {
      if (!chat) return;
      const url = URL.createObjectURL(file);
      const attachment: MediaAttachment = { file, url, type: 'image' };
      await sendMediaMessage(chat.id, attachment, '');
      showToast('Image sent', 'info');
    },
    [chat, sendMediaMessage, showToast]
  );

  const handleVideoSelect = useCallback(
    async (file: File): Promise<void> => {
      if (!chat) return;
      const url = URL.createObjectURL(file);
      const attachment: MediaAttachment = { file, url, type: 'video' };
      await sendMediaMessage(chat.id, attachment, '');
      showToast('Video sent', 'info');
    },
    [chat, sendMediaMessage, showToast]
  );

  const handleFileSelect = useCallback(
    async (file: File): Promise<void> => {
      if (!chat) return;
      const url = URL.createObjectURL(file);
      const attachment: MediaAttachment = { file, url, type: 'file' };
      await sendMediaMessage(chat.id, attachment, '');
      showToast('File sent', 'info');
    },
    [chat, sendMediaMessage, showToast]
  );

  const handleVoiceSend = useCallback(
    async (blob: Blob, _duration: number): Promise<void> => {
      if (!chat) return;
      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm',
      });
      const url = URL.createObjectURL(blob);
      const attachment: MediaAttachment = { file, url, type: 'audio' };
      await sendMediaMessage(chat.id, attachment, '');
      setShowVoiceRecorder(false);
      showToast('Voice message sent', 'info');
    },
    [chat, sendMediaMessage, showToast, setShowVoiceRecorder]
  );

  const handleStickerSelect = useCallback(
    async (sticker: string): Promise<void> => {
      if (!chat) return;
      await sendSticker(chat.id, sticker);
      setShowStickerPicker(false);
    },
    [chat, sendSticker, setShowStickerPicker]
  );

  const handleVoiceCall = useCallback(async (): Promise<void> => {
    if (!chat) return;
    await startCall(chat.id, 'voice');
  }, [chat, startCall]);

  const handleVideoCall = useCallback(async (): Promise<void> => {
    if (!chat) return;
    await startCall(chat.id, 'video');
  }, [chat, startCall]);

  const handleEndCall = useCallback(async (): Promise<void> => {
    await endCall();
  }, [endCall]);

  const handleImageClick = useCallback(
    (url: string): void => {
      const imageUrls = chatMessages
        .filter((m) => m.type === 'image' && m.mediaUrl)
        .map((m) => m.mediaUrl!);
      const idx = imageUrls.indexOf(url);
      setLightboxImages(imageUrls);
      setLightboxIndex(idx >= 0 ? idx : 0);
    },
    [chatMessages, setLightboxImages, setLightboxIndex]
  );

  const scrollToBottom = useCallback((): void => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollRef]);

  return {
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
  };
};
