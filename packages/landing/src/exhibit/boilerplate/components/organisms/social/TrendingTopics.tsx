import type { FC } from 'react';

interface Topic {
  id: string;
  tag: string;
  category: string;
  posts: number;
}

interface TrendingTopicsProps {
  topics: Topic[];
  onSelect?: (id: string) => void;
}

export const TrendingTopics: FC<TrendingTopicsProps> = ({
  topics,
  onSelect,
}) => {
  return (
    <section data-testid="trending-topics" className="card bg-base-200">
      <div className="card-body gap-3">
        <h2 className="text-lg font-medium">Trending now</h2>
        <ol className="flex flex-col gap-2">
          {topics.length === 0 && (
            <li className="text-base-content/60 text-sm">No trending topics</li>
          )}
          {topics.map((topic, index) => (
            <li key={topic.id}>
              <button
                type="button"
                className="hover:bg-base-100 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left"
                onClick={() => onSelect?.(topic.id)}>
                <span className="text-base-content/40 w-6 font-mono">
                  {index + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">
                    #{topic.tag}
                  </span>
                  <span className="text-base-content/50 block text-xs">
                    {topic.category}
                  </span>
                </span>
                <span className="text-base-content/50 text-xs">
                  {topic.posts.toLocaleString()} posts
                </span>
                {index === 0 && (
                  <span className="badge badge-primary">Hot</span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
