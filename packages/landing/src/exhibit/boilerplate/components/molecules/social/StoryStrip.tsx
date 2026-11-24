import type { FC } from 'react';

interface Story {
  id: string;
  name: string;
  avatar?: string;
}

interface StoryStripProps {
  stories: Story[];
  active?: boolean;
  onSelect?: (story: Story) => void;
}

export const StoryStrip: FC<StoryStripProps> = ({
  stories,
  active = true,
  onSelect,
}) => (
  <nav
    aria-label="Stories"
    className="flex gap-3 overflow-x-auto py-2"
    data-testid="story-strip">
    {stories.map((story) => (
      <button
        key={story.id}
        type="button"
        className="flex w-16 shrink-0 flex-col items-center gap-1"
        onClick={() => onSelect?.(story)}>
        <span
          className={`avatar ring ${
            active ? 'ring-primary' : 'ring-base-300'
          } ring-offset-base-100 ring-offset-2`}>
          <span className="bg-primary text-primary-content w-14 rounded-full">
            <span className="text-sm">
              {story.avatar ?? story.name.charAt(0).toUpperCase()}
            </span>
          </span>
        </span>
        <span className="w-16 truncate text-center text-xs">{story.name}</span>
      </button>
    ))}
  </nav>
);
