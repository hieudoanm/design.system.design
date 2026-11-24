import type { FC } from 'react';

interface StoryRingProps {
  name: string;
  src?: string;
  viewed?: boolean;
}

export const StoryRing: FC<StoryRingProps> = ({
  name,
  src,
  viewed = false,
}) => (
  <div className="flex flex-col items-center gap-1" data-testid="story-ring">
    <div
      className={`from-primary to-secondary rounded-full bg-gradient-to-tr p-0.5 ${
        viewed ? 'opacity-40' : ''
      }`}>
      <div className="bg-base-100 rounded-full p-0.5">
        <div className="bg-base-content/15 h-12 w-12 overflow-hidden rounded-full">
          {src ? (
            <img src={src} alt={name} className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-medium">
              {name.charAt(0)}
            </span>
          )}
        </div>
      </div>
    </div>
    <span className="text-base-content/60 text-xs">{name}</span>
  </div>
);
