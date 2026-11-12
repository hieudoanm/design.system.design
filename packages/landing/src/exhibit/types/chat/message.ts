export type MessageType =
  'text' | 'image' | 'video' | 'audio' | 'file' | 'system' | 'sticker';

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Reaction {
  emoji: string;
  authorId: string;
  createdAt: number;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image?: string;
  siteName: string;
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  type: MessageType;
  text: string;
  status: DeliveryStatus;
  createdAt: number;
  editedAt?: number;
  deletedAt?: number;
  replyToId?: string;
  reactions: Reaction[];
  fileName?: string;
  fileSize?: number;
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaDuration?: number;
  mediaMimeType?: string;
  linkPreview?: LinkPreview;
  stickerUrl?: string;
  encrypted?: boolean;
}

export interface MediaAttachment {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio' | 'file';
  compressed?: Blob;
}

export interface UploadProgress {
  messageId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
}
