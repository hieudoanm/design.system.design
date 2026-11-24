'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCamera, FiHeart, FiMapPin } from 'react-icons/fi';

interface Story {
  id: string;
  title: string;
  author: string;
  destination: string;
  likes: number;
}

const STORIES: Story[] = [
  {
    id: 's1',
    title: 'The Long Way Home',
    author: 'Mai Nguyen',
    destination: 'Hanoi, Vietnam',
    likes: 128,
  },
  {
    id: 's2',
    title: 'Desert Skies',
    author: 'Leo Park',
    destination: 'Marrakesh, Morocco',
    likes: 96,
  },
  {
    id: 's3',
    title: 'Island Hopping',
    author: 'Ana Cruz',
    destination: 'Palawan, Philippines',
    likes: 214,
  },
  {
    id: 's4',
    title: 'Alpine Echoes',
    author: 'Sven Keller',
    destination: 'Zermatt, Switzerland',
    likes: 175,
  },
];

export const TravelStoriesTemplate: FC = () => {
  const [stories, setStories] = useState<Story[]>(STORIES);

  const likeStory = (id: string) => {
    setStories((prev) =>
      prev.map((story) =>
        story.id === id ? { ...story, likes: story.likes + 1 } : story
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Stories</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Community adventures.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {stories.length} stories
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stories.map((story) => (
            <div
              key={story.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="bg-base-content/10 flex h-16 items-center justify-center rounded-lg">
                  <FiCamera className="text-base-content/30 h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">{story.title}</p>
                  <p className="text-base-content/50 text-xs">{story.author}</p>
                </div>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiMapPin className="h-3 w-3" />
                  {story.destination}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiHeart className="h-3 w-3" />
                    {story.likes} likes
                  </p>
                  <button
                    onClick={() => likeStory(story.id)}
                    className="btn btn-ghost btn-xs gap-1">
                    <FiHeart />
                    Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

TravelStoriesTemplate.displayName = 'TravelStoriesTemplate';
