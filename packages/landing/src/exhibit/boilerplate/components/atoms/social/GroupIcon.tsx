import type { FC } from 'react';

type GroupType = 'public' | 'private' | 'secret';

interface GroupIconProps {
  type?: GroupType;
}

const groupConfig: Record<GroupType, string> = {
  public: '🌐',
  private: '🔒',
  secret: '🤫',
};

export const GroupIcon: FC<GroupIconProps> = ({ type = 'public' }) => (
  <span
    role="img"
    aria-label={`${type} group`}
    className="text-lg"
    data-testid="group-icon">
    {groupConfig[type]}
  </span>
);
