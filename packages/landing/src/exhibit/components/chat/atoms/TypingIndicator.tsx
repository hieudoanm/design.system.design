import { type FC } from 'react';

interface TypingIndicatorProps {
  names: string[];
}

export const TypingIndicator: FC<TypingIndicatorProps> = ({ names }) => {
  if (names.length === 0) return null;
  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="text-base-content/50 flex items-center gap-1.5 px-4 py-1 text-xs">
      <span className="flex gap-0.5">
        <span className="bg-base-content/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
        <span className="bg-base-content/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
        <span className="bg-base-content/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
      </span>
      <span>{label}</span>
    </div>
  );
};
