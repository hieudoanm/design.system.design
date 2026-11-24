'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiHeart, FiMessageSquare, FiSend } from 'react-icons/fi';

interface Comment {
  author: string;
  text: string;
}

interface Post {
  id: string;
  author: string;
  time: string;
  text: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
}

const POSTS: Post[] = [
  {
    id: 'p1',
    author: 'Jane Doe',
    time: '2 hours ago',
    text: 'Just shipped a new design system at work. Very excited!',
    likes: 24,
    liked: false,
    comments: [
      { author: 'Alex Chen', text: 'Congrats, looks great!' },
      { author: 'Sam Rivera', text: 'Love the color palette.' },
    ],
  },
  {
    id: 'p2',
    author: 'Alex Chen',
    time: '5 hours ago',
    text: 'Anyone else at the TypeScript conference this weekend?',
    likes: 12,
    liked: true,
    comments: [{ author: 'Jane Doe', text: 'I will be there tomorrow.' }],
  },
  {
    id: 'p3',
    author: 'Sam Rivera',
    time: 'Yesterday',
    text: 'Picked up a new hobby: analog photography. First roll developed.',
    likes: 41,
    liked: false,
    comments: [{ author: 'Priya Patel', text: 'The grain looks amazing.' }],
  },
  {
    id: 'p4',
    author: 'Priya Patel',
    time: '2 days ago',
    text: 'Our team won the internal hackathon. Building for accessibility pays off.',
    likes: 67,
    liked: true,
    comments: [{ author: 'Sam Rivera', text: 'Well deserved, congrats!' }],
  },
];

export const FeedTemplate: FC = () => {
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const addComment = (id: string) => {
    const text = (drafts[id] ?? '').trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, comments: [...post.comments, { author: 'You', text }] }
          : post
      )
    );
    setDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Latest updates from your network.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {posts.length} posts
        </p>
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {post.author
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.author}</p>
                    <p className="text-base-content/50 text-xs">{post.time}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">{post.text}</p>
                <div className="mt-3">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`btn btn-sm gap-1 ${
                      post.liked ? 'btn-primary' : 'btn-ghost'
                    }`}>
                    <FiHeart />
                    {post.liked ? 'Liked' : 'Like'} {post.likes}
                  </button>
                </div>
                {post.comments.length > 0 && (
                  <div className="border-base-content/10 mt-3 flex flex-col gap-2 border-t pt-3">
                    {post.comments.map((comment, index) => (
                      <p key={index} className="text-sm">
                        {comment.author}: {comment.text}
                      </p>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <textarea
                    aria-label={`Add a comment on ${post.author}'s post`}
                    placeholder="Write a comment..."
                    value={drafts[post.id] ?? ''}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [post.id]: event.target.value,
                      }))
                    }
                    className="textarea textarea-bordered textarea-sm w-full"
                  />
                  <button
                    onClick={() => addComment(post.id)}
                    className="btn btn-primary btn-sm gap-1">
                    <FiSend />
                    Post
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

FeedTemplate.displayName = 'FeedTemplate';
