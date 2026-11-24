import type { FC, ReactNode } from 'react';

interface StoryKickerProps {
  children: ReactNode;
}

export const StoryKicker: FC<StoryKickerProps> = ({ children }) => (
  <p
    className="text-primary text-xs font-semibold tracking-widest uppercase"
    data-testid="story-kicker">
    {children}
  </p>
);
