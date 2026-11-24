import type { FC } from 'react';

interface TopStory {
  title: string;
  category: string;
  imageAlt: string;
}

interface TopStoriesProps {
  stories: TopStory[];
  title?: string;
}

export const TopStories: FC<TopStoriesProps> = ({
  stories,
  title = 'Top Stories',
}) => {
  const [hero, ...rest] = stories;

  return (
    <section data-testid="top-stories" className="flex w-full flex-col gap-4">
      <h2>{title}</h2>
      {hero && (
        <article className="card bg-base-200 border-base-content/10 overflow-hidden rounded-xl border">
          <div
            role="img"
            aria-label={hero.imageAlt}
            className="from-primary to-secondary h-56 w-full bg-gradient-to-br"
          />
          <div className="card-body">
            <span className="badge badge-error badge-sm w-fit">
              {hero.category}
            </span>
            <h3 className="text-2xl">{hero.title}</h3>
          </div>
        </article>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {rest.map((story, index) => (
          <li
            key={index}
            className="card bg-base-200 border-base-content/10 flex-row items-center gap-3 rounded-xl border p-3">
            <div
              role="img"
              aria-label={story.imageAlt}
              className="from-secondary to-accent h-16 w-20 shrink-0 rounded-lg bg-gradient-to-br"
            />
            <div className="flex flex-col gap-1">
              <span className="badge badge-primary badge-sm w-fit">
                {story.category}
              </span>
              <h4 className="text-sm font-medium">{story.title}</h4>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
