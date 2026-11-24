import type { FC } from 'react';

interface ExploreItem {
  id: string;
  label: string;
  type: 'photo' | 'video' | 'article' | 'audio';
  likes: number;
}

interface ExploreGridProps {
  items: ExploreItem[];
  categories?: string[];
  onSelect?: (id: string) => void;
}

const TYPE_BADGE: Record<ExploreItem['type'], string> = {
  photo: 'badge-primary',
  video: 'badge-secondary',
  article: 'badge-accent',
  audio: 'badge-info',
};

const TYPE_ICON: Record<ExploreItem['type'], string> = {
  photo: '◦',
  video: '▶',
  article: '¶',
  audio: '♪',
};

export const ExploreGrid: FC<ExploreGridProps> = ({
  items,
  categories = ['For you', 'Following', 'Trending'],
  onSelect,
}) => {
  return (
    <section data-testid="explore-grid" className="flex flex-col gap-4">
      <div className="tabs tabs-boxed w-fit">
        {categories.map((category, index) => (
          <button
            key={category}
            type="button"
            className={`tab ${index === 0 ? 'tab-active' : ''}`}>
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="card bg-base-200 group relative overflow-hidden text-left"
            onClick={() => onSelect?.(item.id)}>
            <div className="bg-secondary/30 flex aspect-square items-center justify-center">
              <span className="text-3xl" aria-hidden="true">
                {TYPE_ICON[item.type]}
              </span>
            </div>
            <div className="card-body gap-1 p-3">
              <h3 className="line-clamp-1 text-sm font-medium">{item.label}</h3>
              <p className="text-base-content/50 text-xs">
                <span aria-hidden="true">&#10084;</span>{' '}
                {item.likes.toLocaleString()}
              </p>
              <span className={`badge badge-sm w-fit ${TYPE_BADGE[item.type]}`}>
                {item.type}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
