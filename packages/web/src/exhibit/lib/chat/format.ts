import type { DeliveryStatus, Message } from '@/exhibit/types/chat';

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const formatChatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatDayDivider = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatLastSeen = (online: boolean, lastSeenAt: number): string => {
  if (online) return 'online';
  const diff = Date.now() - lastSeenAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'last seen just now';
  if (minutes < 60) return `last seen ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `last seen ${hours}h ago`;
  return `last seen ${formatChatTime(lastSeenAt)}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

export const statusTicks = (status: DeliveryStatus): string => {
  switch (status) {
    case 'sending':
      return '✓';
    case 'sent':
      return '✓✓';
    case 'delivered':
      return '✓✓';
    case 'read':
      return '✓✓';
  }
};

export const statusLabel = (status: DeliveryStatus): string => {
  switch (status) {
    case 'sending':
      return 'Sending';
    case 'sent':
      return 'Sent';
    case 'delivered':
      return 'Delivered';
    case 'read':
      return 'Read';
  }
};

export const isEdited = (message: Message): boolean =>
  message.editedAt !== undefined && message.editedAt > message.createdAt;

export const searchMessages = (
  messages: Message[],
  query: string
): Message[] =>
  query.trim() === ''
    ? []
    : messages.filter(
        (m) =>
          m.type === 'text' &&
          m.deletedAt === undefined &&
          m.text.toLowerCase().includes(query.trim().toLowerCase())
      );
