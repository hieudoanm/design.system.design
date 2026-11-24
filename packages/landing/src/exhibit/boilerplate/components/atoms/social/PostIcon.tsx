import type { FC } from 'react';

type PostType = 'text' | 'image' | 'video' | 'link' | 'poll';

interface PostIconProps {
  type: PostType;
}

const postConfig: Record<PostType, string> = {
  text: '📝',
  image: '🖼️',
  video: '🎬',
  link: '🔗',
  poll: '📊',
};

export const PostIcon: FC<PostIconProps> = ({ type }) => (
  <span
    role="img"
    aria-label={`${type} post`}
    className="text-lg"
    data-testid="post-icon">
    {postConfig[type]}
  </span>
);
