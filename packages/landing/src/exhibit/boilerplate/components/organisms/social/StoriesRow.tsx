import type { FC } from 'react';

interface Story {
  id: string;
  username: string;
  emoji: string;
  seen?: boolean;
}

interface StoriesRowProps {
  stories: Story[];
  onOpen?: (id: string) => void;
  onCreate?: () => void;
}

export const StoriesRow: FC<StoriesRowProps> = ({
  stories,
  onOpen,
  onCreate,
}) => {
  return (
    <section data-testid="stories-row" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Stories</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          className="flex shrink-0 flex-col items-center gap-1"
          onClick={onCreate}>
          <div className="border-base-content/20 bg-base-200 flex h-16 w-16 items-center justify-center rounded-full border-2 text-2xl">
            <span aria-hidden="true">+</span>
          </div>
          <span className="text-xs">Create</span>
        </button>
        {stories.map((story) => (
          <button
            key={story.id}
            type="button"
            className="flex shrink-0 flex-col items-center gap-1"
            onClick={() => onOpen?.(story.id)}>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                story.seen
                  ? 'bg-base-200 opacity-50'
                  : 'bg-primary text-primary-content ring-primary ring-2'
              }`}>
              <span aria-hidden="true">{story.emoji}</span>
            </div>
            <span className="text-xs">{story.username}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
