'use client';

import { type FC, useState, useCallback } from 'react';
import { FaRegEdit, FaReply, FaFile, FaDownload } from 'react-icons/fa';
import type { Message } from '@/exhibit/types/chat';
import {
  formatChatTime,
  isEdited,
  statusTicks,
  statusLabel,
  formatFileSize,
} from '@/exhibit/lib/chat/format';
import { ReactionBar } from '@/exhibit/components/chat/molecules/ReactionBar';
import { MessageContextMenu } from '@/exhibit/components/chat/molecules/MessageContextMenu';
import { LinkPreviewCard } from '@/exhibit/components/chat/molecules/LinkPreviewCard';

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
  authorName?: string;
  onReact: (emoji: string) => void;
  onReply?: () => void;
  onCopy?: () => void;
  onForward?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDeleteForEveryone?: () => void;
  quotedMessage?: Message;
  quotedAuthorName?: string;
  highlight?: string;
  highlighted?: boolean;
  onImageClick?: (url: string) => void;
}

const highlightText = (text: string, query: string): React.ReactNode => {
  if (query.trim() === '') return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-warning/40 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  mine,
  authorName,
  onReact,
  onReply,
  onCopy,
  onForward,
  onEdit,
  onDelete,
  onDeleteForEveryone,
  quotedMessage,
  quotedAuthorName,
  highlight = '',
  highlighted = false,
  onImageClick,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const alignment = mine ? 'justify-end' : 'justify-start';
  const bubbleClass = mine
    ? 'bg-primary text-primary-content rounded-br-sm'
    : 'bg-base-200 text-base-content rounded-bl-sm';
  const showAuthor = !mine && authorName !== undefined;
  const hasActions =
    onReply || onCopy || onForward || onEdit || onDelete || onDeleteForEveryone;

  return (
    <div
      className={`flex flex-col ${alignment} ${highlighted ? 'bg-warning/10 -mx-1 rounded-lg px-1 py-0.5' : ''}`}>
      {showAuthor && (
        <span className="text-secondary mb-0.5 text-xs font-semibold">
          {authorName}
        </span>
      )}
      <div
        className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
        {quotedMessage && (
          <div
            className={`border-base-300 mb-1 max-w-full truncate rounded-t-xl border-t-2 border-l-2 px-2 py-1 text-xs ${
              mine
                ? 'border-l-primary-content/50 border-t-primary-content/50 bg-primary/20'
                : 'border-l-base-content/30 border-t-base-content/30 bg-base-300/50'
            }`}>
            <span className="font-semibold">
              {quotedAuthorName ?? 'Unknown'}
            </span>
            <p className="truncate opacity-70">
              {quotedMessage.deletedAt !== undefined
                ? 'Message deleted'
                : quotedMessage.text}
            </p>
          </div>
        )}
        <div
          className={`rounded-2xl px-3 py-1.5 text-sm ${bubbleClass} ${hasActions ? 'cursor-pointer' : ''} ${message.type === 'sticker' ? 'bg-transparent !p-0' : ''}`}
          onContextMenu={handleContextMenu}>
          {message.deletedAt !== undefined ? (
            <span className="text-base-content/50 italic">Message deleted</span>
          ) : (
            <>
              {message.type === 'sticker' && message.stickerUrl ? (
                message.stickerUrl.startsWith('http') ? (
                  <img
                    src={message.stickerUrl}
                    alt="Sticker"
                    className="h-24 w-24 object-contain"
                  />
                ) : (
                  <span className="text-6xl">{message.stickerUrl}</span>
                )
              ) : message.type === 'image' && message.mediaUrl ? (
                <button
                  type="button"
                  onClick={() => onImageClick?.(message.mediaUrl!)}
                  className="block overflow-hidden rounded-xl">
                  <img
                    src={message.mediaUrl}
                    alt={message.text || 'Image'}
                    className="max-h-64 max-w-64 object-cover"
                  />
                </button>
              ) : message.type === 'video' && message.mediaUrl ? (
                <video
                  src={message.mediaUrl}
                  controls
                  className="max-h-64 max-w-64 rounded-xl"
                />
              ) : message.type === 'audio' && message.mediaUrl ? (
                <div className="min-w-[200px]">
                  <audio src={message.mediaUrl} controls className="w-full" />
                </div>
              ) : message.type === 'file' ? (
                <div className="flex items-center gap-2">
                  <FaFile
                    aria-hidden="true"
                    className="h-8 w-8 shrink-0 opacity-60"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {message.fileName ?? 'File'}
                    </p>
                    {message.fileSize !== undefined && (
                      <p className="text-xs opacity-60">
                        {formatFileSize(message.fileSize)}
                      </p>
                    )}
                  </div>
                  {message.mediaUrl && (
                    <a
                      href={message.mediaUrl}
                      download={message.fileName}
                      className="btn btn-xs btn-ghost"
                      aria-label="Download">
                      <FaDownload aria-hidden="true" />
                    </a>
                  )}
                </div>
              ) : (
                <span className="break-words whitespace-pre-wrap">
                  {highlight
                    ? highlightText(message.text, highlight)
                    : message.text}
                </span>
              )}
            </>
          )}
          {message.type !== 'sticker' && (
            <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
              {message.replyToId !== undefined && (
                <FaReply aria-label="Replied" className="h-2.5 w-2.5" />
              )}
              {isEdited(message) && (
                <span>
                  <FaRegEdit
                    aria-label="Edited"
                    className="mr-0.5 inline h-2.5 w-2.5"
                  />
                  edited
                </span>
              )}
              {formatChatTime(message.createdAt)}
              {mine && message.deletedAt === undefined && (
                <span
                  title={statusLabel(message.status)}
                  className={message.status === 'read' ? 'text-info' : ''}>
                  {statusTicks(message.status)}
                </span>
              )}
            </span>
          )}
        </div>
        {message.fileName && message.type !== 'file' && (
          <span className="text-base-content/50 mt-0.5 text-[11px]">
            {message.fileName}
            {message.fileSize !== undefined &&
              ` · ${formatFileSize(message.fileSize)}`}
          </span>
        )}
        {message.linkPreview && (
          <LinkPreviewCard preview={message.linkPreview} />
        )}
        {message.deletedAt === undefined && message.reactions.length > 0 && (
          <ReactionBar message={message} mine={mine} onReact={onReact} />
        )}
      </div>
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isMine={mine}
          onClose={() => setContextMenu(null)}
          onReply={onReply ?? (() => {})}
          onCopy={onCopy ?? (() => {})}
          onForward={onForward ?? (() => {})}
          onEdit={onEdit ?? (() => {})}
          onDelete={onDelete ?? (() => {})}
          onDeleteForEveryone={onDeleteForEveryone}
        />
      )}
    </div>
  );
};
