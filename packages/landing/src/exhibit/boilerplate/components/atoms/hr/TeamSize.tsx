import type { FC } from 'react';

interface TeamSizeProps {
  count: number;
  label?: string;
}

export const TeamSize: FC<TeamSizeProps> = ({
  count,
  label = 'team members',
}) => (
  <span data-testid="team-size" className="text-base-content/70 text-sm">
    <span aria-hidden="true" className="mr-1">
      👥
    </span>
    {count} {label}
  </span>
);
