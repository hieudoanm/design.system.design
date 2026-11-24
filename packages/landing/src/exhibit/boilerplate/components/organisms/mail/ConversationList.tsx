import type { FC } from 'react';

interface Conversation {
  id: string;
  participants: string;
  subject: string;
  preview: string;
  lastTime: string;
  unread?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelect?: (conversation: Conversation) => void;
}

export const ConversationList: FC<ConversationListProps> = ({
  conversations,
  onSelect,
}) => (
  <div
    className="border-base-content/10 bg-base-200 w-full overflow-hidden rounded-xl border"
    data-testid="conversation-list">
    <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-sm font-medium">Conversations</h3>
      <span className="badge badge-ghost badge-sm">{conversations.length}</span>
    </header>
    <ul className="flex flex-col">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            onClick={() => onSelect?.(conversation)}
            className={`hover:bg-base-300/60 flex w-full flex-col gap-0.5 px-4 py-3 text-left ${
              conversation.unread ? 'bg-primary/5' : ''
            }`}>
            <span className="flex items-center gap-2">
              {conversation.unread && (
                <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              )}
              <span className="text-sm font-medium">
                {conversation.participants}
              </span>
              <span className="text-base-content/40 ml-auto text-xs">
                {conversation.lastTime}
              </span>
            </span>
            <span className="text-sm">{conversation.subject}</span>
            <span className="text-base-content/50 text-xs">
              {conversation.preview}
            </span>
          </button>
        </li>
      ))}
      {conversations.length === 0 && (
        <li className="text-base-content/40 p-4 text-center text-sm">
          No conversations
        </li>
      )}
    </ul>
  </div>
);

ConversationList.displayName = 'ConversationList';
