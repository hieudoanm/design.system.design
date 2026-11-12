import { type FC } from 'react';
import type { Message } from '@/exhibit/types/chat';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥'];

interface ReactionBarProps {
  message: Message;
  mine: boolean;
  onReact: (emoji: string) => void;
}

export const ReactionBar: FC<ReactionBarProps> = ({
  message,
  mine,
  onReact,
}) => {
  const grouped = new Map<string, number>();
  for (const r of message.reactions) {
    grouped.set(r.emoji, (grouped.get(r.emoji) ?? 0) + 1);
  }

  return (
    <div
      className={`mt-1 flex flex-wrap gap-1 ${mine ? 'justify-end' : 'justify-start'}`}
      data-testid="reaction-bar">
      {[...grouped.entries()].map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onReact(emoji)}
          aria-label={`React with ${emoji}`}
          className="badge badge-ghost badge-sm border-base-300 gap-1 border">
          <span>{emoji}</span>
          <span className="text-[10px]">{count}</span>
        </button>
      ))}
      <div className="dropdown dropdown-top">
        <button
          type="button"
          tabIndex={0}
          aria-label="Add reaction"
          className="badge badge-ghost badge-sm border-base-300 border">
          <span className="text-xs">＋</span>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content border-base-300 bg-base-100 z-10 mt-1 flex gap-1 rounded-xl border p-1 shadow-xl">
          {EMOJIS.map((emoji) => (
            <li key={emoji}>
              <button
                type="button"
                onClick={() => onReact(emoji)}
                aria-label={`Add ${emoji}`}
                className="btn btn-xs btn-ghost">
                {emoji}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
