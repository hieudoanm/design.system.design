'use client';

import type { FC, FormEvent, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiList } from 'react-icons/fi';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  model?: string;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

interface ModelOption {
  company: string;
  label: string;
  value: string;
}

interface ChatTemplateProps {
  initialMessages?: ChatMessage[];
  model?: string;
  onSendMessage?: (message: string) => Promise<string>;
  onModelChange?: (model: string) => void;
  onNewChat?: () => void;
  conversations?: ChatConversation[];
  activeConversationId?: string;
  onConversationSelect?: (id: string) => void;
  models?: ModelOption[];
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ChatBubble: FC<{
  role: ChatRole;
  content: string;
  model?: string;
}> = ({ role, content, model }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] flex-col gap-1`}>
        {model && !isUser && (
          <p className="text-base-content/40 px-1 text-xs">{model}</p>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-content rounded-br-md'
              : 'bg-base-200 border-base-300 rounded-bl-md border'
          }`}>
          <p className="break-words whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
};
ChatBubble.displayName = 'ChatBubble';

const formatTime = (ts: number): string => {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) return time;

  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${date} ${time}`;
};

const ChatTimestamp: FC<{ timestamp: number }> = ({ timestamp }) => (
  <span className="text-base-content/30 text-[10px]">
    {formatTime(timestamp)}
  </span>
);
ChatTimestamp.displayName = 'ChatTimestamp';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Type a message...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 px-6 py-4">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="textarea textarea-bordered border-base-300 bg-base-200 text-base-content placeholder:text-base-content/30 w-full resize-none scrollbar-none rounded-2xl px-5 py-3 pr-12 text-sm leading-relaxed focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="btn btn-primary btn-square flex h-11 w-11 shrink-0 items-center justify-center rounded-xl disabled:opacity-40">
        {disabled ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        )}
      </button>
    </form>
  );
};
ChatInput.displayName = 'ChatInput';

interface ChatMessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
}

const ChatMessageList: FC<ChatMessageListProps> = ({ messages, loading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!messages.length) {
    return (
      <div className="flex grow items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl opacity-20">💬</div>
          <p className="text-base-content/50 mb-2 text-sm">
            Start a conversation
          </p>
          <p className="text-base-content/30 text-xs">
            Send a message to begin chatting with AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col gap-4 overflow-y-auto px-6 py-6">
      {messages.map((msg) => (
        <div key={msg.id} className="flex flex-col gap-1">
          <ChatBubble role={msg.role} content={msg.content} model={msg.model} />
          <div
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} px-1`}>
            <ChatTimestamp timestamp={msg.timestamp} />
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-base-200 border-base-300 flex items-center gap-2 rounded-2xl border px-5 py-4">
            <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:0s]" />
            <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:0.15s]" />
            <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:0.3s]" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
ChatMessageList.displayName = 'ChatMessageList';

interface ChatModelSelectProps {
  models: ModelOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ChatModelSelect: FC<ChatModelSelectProps> = ({
  models,
  value,
  onChange,
  disabled,
}) => {
  const grouped = models.reduce<{ company: string; models: ModelOption[] }[]>(
    (acc, model) => {
      const existing = acc.find((g) => g.company === model.company);
      if (existing) {
        existing.models.push(model);
      } else {
        acc.push({ company: model.company, models: [model] });
      }
      return acc;
    },
    []
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="select select-ghost select-sm text-base-content/60 hover:text-base-content text-xs">
      {grouped.map(({ company, models: groupModels }) => (
        <optgroup key={company} label={company}>
          {groupModels.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};
ChatModelSelect.displayName = 'ChatModelSelect';

interface ChatHeaderProps {
  title?: string;
  model: string;
  models: ModelOption[];
  onModelChange: (value: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
  disabled?: boolean;
}

const ChatHeader: FC<ChatHeaderProps> = ({
  title = 'Chat',
  model,
  models,
  onModelChange,
  onNewChat,
  onToggleSidebar,
  sidebarOpen,
  disabled,
}) => {
  return (
    <div className="border-base-300 bg-base-100/85 flex min-h-[60px] items-center justify-between border-b px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-ghost btn-sm btn-square text-base-content/50">
          <FiList className="h-5 w-5" />
        </button>
        <span className="text-base-content font-serif text-lg font-bold tracking-widest">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ChatModelSelect
          models={models}
          value={model}
          onChange={onModelChange}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onNewChat}
          disabled={disabled}
          className="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content text-xs">
          New chat
        </button>
      </div>
    </div>
  );
};
ChatHeader.displayName = 'ChatHeader';

interface ChatFooterProps {
  disclaimer?: string;
}

const ChatFooter: FC<ChatFooterProps> = ({
  disclaimer = 'AI responses are generated and may not be accurate. Verify important information.',
}) => {
  return (
    <div className="border-base-300 border-t px-6 py-3 text-center">
      <p className="text-base-content/20 text-xs">{disclaimer}</p>
    </div>
  );
};
ChatFooter.displayName = 'ChatFooter';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  open: boolean;
}

const ChatSidebar: FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  open,
}) => {
  if (!open) return null;

  return (
    <div className="bg-base-200 border-base-300 flex w-72 shrink-0 flex-col border-r">
      <div className="border-base-300 flex items-center justify-between border-b px-4 py-4">
        <span className="text-base-content/50 text-xs font-medium tracking-[0.14em] uppercase">
          Conversations
        </span>
        <button
          type="button"
          onClick={onNewChat}
          className="btn btn-ghost btn-xs text-base-content/50 hover:text-base-content">
          + New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <p className="text-base-content/30 mb-2 text-xs">
              No conversations yet
            </p>
            <p className="text-base-content/20 text-xs">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelect(conv.id)}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                conv.id === activeId
                  ? 'bg-primary/10 border-primary/30 text-base-content border-l-2'
                  : 'text-base-content/60 hover:bg-base-300/50 hover:text-base-content border-l-2 border-transparent'
              }`}>
              <span className="line-clamp-1">{conv.title}</span>
              <span className="text-base-content/20 mt-0.5 block text-xs">
                {conv.messages.length} messages
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
ChatSidebar.displayName = 'ChatSidebar';

let messageIdCounter = 0;
const nextId = () => `msg-${++messageIdCounter}`;

export const ChatTemplate: FC<ChatTemplateProps> = ({
  initialMessages,
  model: initialModel,
  onSendMessage: externalSend,
  onModelChange: externalModelChange,
  onNewChat: externalNewChat,
  conversations = [],
  activeConversationId,
  onConversationSelect,
  models = [],
  sidebarOpen: initialSidebarOpen,
  onToggleSidebar: externalToggleSidebar,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(initialModel ?? '');
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen ?? true);

  const toggleSidebar = useCallback(() => {
    if (externalToggleSidebar) {
      externalToggleSidebar();
    } else {
      setSidebarOpen((s) => !s);
    }
  }, [externalToggleSidebar]);

  const handleModelChange = useCallback(
    (value: string) => {
      setModel(value);
      externalModelChange?.(value);
    },
    [externalModelChange]
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setLoading(false);
    externalNewChat?.();
  }, [externalNewChat]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: ChatMessage = {
        id: nextId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
        model,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      if (externalSend) {
        try {
          const response = await externalSend(text);
          const aiMessage: ChatMessage = {
            id: nextId(),
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
            model,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } catch {
          const errorMessage: ChatMessage = {
            id: nextId(),
            role: 'assistant',
            content: 'Sorry, an error occurred. Please try again.',
            timestamp: Date.now(),
            model,
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      }
      setLoading(false);
    },
    [loading, model, externalSend]
  );

  return (
    <div className="bg-base-100 text-base-content flex h-screen flex-col font-sans">
      <ChatHeader
        model={model}
        models={models}
        onModelChange={handleModelChange}
        onNewChat={handleNewChat}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        disabled={loading}
      />
      <div className="flex min-h-0 flex-1">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => onConversationSelect?.(id)}
          onNewChat={handleNewChat}
          open={sidebarOpen}
        />
        <div className="flex flex-1 flex-col">
          <ChatMessageList messages={messages} loading={loading} />
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSendMessage}
            disabled={loading}
          />
          <ChatFooter />
        </div>
      </div>
    </div>
  );
};
ChatTemplate.displayName = 'ChatTemplate';
