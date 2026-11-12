'use client';

import { type FC } from 'react';
import { MessageBubble } from '@/exhibit/components/chat/molecules/MessageBubble';
import { DateDivider } from '@/exhibit/components/chat/molecules/DateDivider';
import type { Message } from '@/exhibit/types/chat';

interface MessageListProps {
  grouped: Array<{ message: Message; isNewDay: boolean }>;
  contacts: Array<{ id: string; name: string }>;
  messages: Message[];
  highlightedIds: Set<string>;
  searchQuery: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onCopy: (text: string) => void;
  onForward: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (chatId: string, messageId: string) => void;
  onDeleteForEveryone: (chatId: string, messageId: string) => void;
  onImageClick: (url: string) => void;
  chatId: string;
}

export const MessageList: FC<MessageListProps> = ({
  grouped,
  contacts,
  messages,
  highlightedIds,
  searchQuery,
  onReact,
  onReply,
  onCopy,
  onForward,
  onEdit,
  onDelete,
  onDeleteForEveryone,
  onImageClick,
  chatId,
}) => {
  if (grouped.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-base-content/50 text-sm">
          No messages yet — say hello!
        </p>
      </div>
    );
  }

  return (
    <>
      {grouped.map(({ message, isNewDay }) => {
        const quotedMessage = message.replyToId
          ? messages.find((m) => m.id === message.replyToId)
          : undefined;
        const quotedAuthorName = quotedMessage
          ? quotedMessage.authorId === 'me'
            ? 'You'
            : contacts.find((c) => c.id === quotedMessage.authorId)?.name
          : undefined;
        return (
          <div
            key={message.id}
            id={`message-${message.id}`}
            className="flex flex-col gap-1.5">
            {isNewDay && <DateDivider timestamp={message.createdAt} />}
            <MessageBubble
              message={message}
              mine={message.authorId === 'me'}
              authorName={
                message.authorId !== 'me'
                  ? contacts.find((c) => c.id === message.authorId)?.name
                  : undefined
              }
              onReact={(emoji) => onReact(message.id, emoji)}
              onReply={() => onReply(message)}
              onCopy={() => onCopy(message.text)}
              onForward={() => onForward(message)}
              onEdit={() => onEdit(message)}
              onDelete={() => onDelete(chatId, message.id)}
              onDeleteForEveryone={() =>
                onDeleteForEveryone(chatId, message.id)
              }
              quotedMessage={quotedMessage}
              quotedAuthorName={quotedAuthorName}
              highlight={searchQuery.trim()}
              highlighted={highlightedIds.has(message.id)}
              onImageClick={onImageClick}
            />
          </div>
        );
      })}
    </>
  );
};
