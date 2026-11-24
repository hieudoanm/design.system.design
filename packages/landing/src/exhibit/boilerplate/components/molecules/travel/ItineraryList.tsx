import type { FC } from 'react';

interface ItineraryItem {
  time: string;
  title: string;
  detail?: string;
}

interface ItineraryListProps {
  items: ItineraryItem[];
}

export const ItineraryList: FC<ItineraryListProps> = ({ items }) => (
  <ol className="flex flex-col gap-4" data-testid="itinerary-list">
    {items.map((item) => (
      <li key={`${item.time}-${item.title}`} className="flex gap-3">
        <span className="badge badge-outline h-fit w-16 justify-center font-mono">
          {item.time}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{item.title}</span>
          {item.detail && (
            <span className="text-base-content/60 text-sm">{item.detail}</span>
          )}
        </div>
      </li>
    ))}
  </ol>
);
