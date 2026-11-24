import type { FC } from 'react';

interface TechArticle {
  title: string;
  tag: string;
  readTime: string;
  imageAlt: string;
}

interface TechnologySectionProps {
  articles: TechArticle[];
  title?: string;
}

export const TechnologySection: FC<TechnologySectionProps> = ({
  articles,
  title = 'Technology',
}) => (
  <section
    data-testid="technology-section"
    className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <article
          key={index}
          className="card bg-base-200 border-base-content/10 overflow-hidden rounded-xl border">
          <div
            role="img"
            aria-label={article.imageAlt}
            className="from-secondary to-success h-36 w-full bg-gradient-to-br"
          />
          <div className="card-body">
            <div className="flex items-center justify-between">
              <span className="badge badge-success badge-sm">
                {article.tag}
              </span>
              <span className="text-base-content/50 text-xs">
                {article.readTime}
              </span>
            </div>
            <h3 className="card-title">{article.title}</h3>
          </div>
        </article>
      ))}
    </div>
  </section>
);
