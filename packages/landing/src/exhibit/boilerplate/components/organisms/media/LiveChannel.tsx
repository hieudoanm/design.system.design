import type { FC } from 'react';

interface ChannelInfo {
  name: string;
  category: string;
  viewers: number;
  quality: string;
}

interface LiveChannelProps {
  channel: ChannelInfo;
  streamTitle?: string;
  onFollow?: () => void;
}

const formatViewers = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const LiveChannel: FC<LiveChannelProps> = ({
  channel,
  streamTitle = 'Live now',
  onFollow,
}) => {
  return (
    <section data-testid="live-channel" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <figure className="relative flex aspect-video items-center justify-center">
          <span className="text-base-content/30 text-4xl" aria-hidden="true">
            &#9654;
          </span>
          <span className="badge badge-error absolute top-3 left-3 gap-1">
            <span className="loading loading-ring loading-xs" />
            LIVE
          </span>
          <span className="badge badge-neutral absolute top-3 right-3">
            {channel.quality}
          </span>
        </figure>
        <div className="card-body gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="card-title">{streamTitle}</h2>
              <p className="text-base-content/60 text-sm">{channel.name}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onFollow}>
              Follow
            </button>
          </div>
          <div className="stats stats-vertical bg-base-100 sm:stats-horizontal">
            <div className="stat">
              <div className="stat-title">Category</div>
              <div className="stat-value text-lg">{channel.category}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Viewers</div>
              <div className="stat-value text-lg" data-testid="viewers">
                {formatViewers(channel.viewers)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card bg-base-200">
        <div className="card-body gap-2 p-4">
          <h3 className="text-sm font-medium">Live chat</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <strong>raein</strong>: loving this set
            </li>
            <li>
              <strong>mikeq</strong>: hi from the bay
            </li>
          </ul>
          <div className="form-control mt-1 flex flex-row gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              placeholder="Say something..."
              aria-label="Chat message"
            />
            <button type="button" className="btn btn-primary btn-sm">
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
