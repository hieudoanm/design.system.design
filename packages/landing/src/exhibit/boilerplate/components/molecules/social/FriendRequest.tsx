import type { FC } from 'react';

interface FriendRequestProps {
  name: string;
  mutual?: number;
  avatar?: string;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const FriendRequest: FC<FriendRequestProps> = ({
  name,
  mutual = 0,
  avatar,
  onAccept,
  onDecline,
}) => (
  <div
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="friend-request">
    <div className="card-body flex-row items-center gap-3">
      <div className="avatar placeholder">
        <div className="bg-secondary text-secondary-content w-12 rounded-full">
          <span>{avatar ?? name.charAt(0).toUpperCase()}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-base-content/50 text-xs">{mutual} mutual friends</p>
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={onAccept}>
          Accept
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  </div>
);
