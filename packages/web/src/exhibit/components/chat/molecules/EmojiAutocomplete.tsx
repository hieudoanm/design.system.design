'use client';

import { type FC, useMemo } from 'react';

const EMOJI_MAP: Record<string, string> = {
  ':)': '😊',
  ':-)': '😊',
  ':(': '😞',
  ':-(': '😞',
  ':D': '😃',
  ':-D': '😃',
  ';)': '😉',
  ';-)': '😉',
  ':O': '😮',
  ':-O': '😮',
  '<3': '❤️',
  '</3': '💔',
  ':*': '😘',
  ':-*': '😘',
  XD: '😆',
  ':P': '😛',
  ':-P': '😛',
  ':|': '😐',
  ':-|': '😐',
  ':@': '😡',
  'B)': '😎',
  'B-)': '😎',
  '^.^': '😊',
  T_T: '😭',
  '-_-': '😑',
  O_O: '😮',
  '>_<': '😣',
  ':3': '😊',
  '(y)': '👍',
  '(Y)': '👍',
  '(n)': '👎',
  '(N)': '👎',
  ':clap:': '👏',
  ':fire:': '🔥',
  ':heart:': '❤️',
  ':star:': '⭐',
  ':100:': '💯',
  ':ok:': '👌',
  ':wave:': '👋',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎',
  ':smile:': '😊',
  ':laugh:': '😄',
  ':wink:': '😉',
  ':cry:': '😢',
  ':angry:': '😡',
  ':love:': '😍',
  ':cool:': '😎',
  ':think:': '🤔',
  ':shrug:': '🤷',
  ':pray:': '🙏',
  ':muscle:': '💪',
  ':rocket:': '🚀',
  ':sparkles:': '✨',
  ':tada:': '🎉',
  ':party:': '🥳',
  ':cake:': '🎂',
  ':gift:': '🎁',
  ':coffee:': '☕',
  ':beer:': '🍺',
  ':wine:': '🍷',
};

interface EmojiSuggestion {
  shortcode: string;
  emoji: string;
}

interface EmojiAutocompleteProps {
  query: string;
  onSelect: (emoji: string) => void;
}

export const EmojiAutocomplete: FC<EmojiAutocompleteProps> = ({
  query,
  onSelect,
}) => {
  const suggestions = useMemo<EmojiSuggestion[]>(() => {
    const term = query.toLowerCase();
    if (term.length < 2) return [];
    return Object.entries(EMOJI_MAP)
      .filter(([key]) => key.includes(term))
      .slice(0, 8)
      .map(([shortcode, emoji]) => ({ shortcode, emoji }));
  }, [query]);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-base-100 border-base-300 absolute bottom-full left-0 mb-1 flex gap-1 rounded-lg border p-1.5 shadow-lg">
      {suggestions.map((s) => (
        <button
          key={s.shortcode}
          type="button"
          onClick={() => onSelect(s.emoji)}
          title={s.shortcode}
          className="btn btn-xs btn-ghost text-lg">
          {s.emoji}
        </button>
      ))}
    </div>
  );
};
