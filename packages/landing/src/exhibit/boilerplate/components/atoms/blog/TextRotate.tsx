import type { CSSProperties, FC } from 'react';

interface TextRotateProps {
  words: string[];
  duration?: number;
  className?: string;
}

export const TextRotate: FC<TextRotateProps> = ({
  words,
  duration = 3000,
  className = '',
}) => {
  const style = { '--duration': `${duration}ms` } as CSSProperties;

  return (
    <span className={`text-rotate ${className}`} style={style}>
      <span>
        {words.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </span>
    </span>
  );
};

TextRotate.displayName = 'TextRotate';
