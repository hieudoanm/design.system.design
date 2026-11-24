import type { FC, ReactNode } from 'react';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'assistant';
  name?: string;
  time?: string;
  avatar?: ReactNode;
}

export const ChatBubble: FC<ChatBubbleProps> = ({
  message,
  sender,
  name,
  time,
  avatar,
}) => {
  const isUser = sender === 'user';

  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      {avatar && (
        <div className="chat-image avatar placeholder">
          <div className="bg-neutral text-neutral-content w-8 rounded-full">
            {avatar}
          </div>
        </div>
      )}
      <div className="chat-header">
        {name && <span className="text-xs">{name}</span>}
        {time && (
          <time className="text-base-content/50 ml-1 text-xs">{time}</time>
        )}
      </div>
      <div
        className={`chat-bubble text-sm ${isUser ? 'chat-bubble-primary' : 'bg-base-200'}`}>
        {message}
      </div>
    </div>
  );
};
