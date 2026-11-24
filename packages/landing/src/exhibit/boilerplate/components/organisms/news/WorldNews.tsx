import type { FC } from 'react';

interface WorldArticle {
  title: string;
  region: string;
  excerpt: string;
  imageAlt: string;
}

interface WorldNewsProps {
  articles: WorldArticle[];
  title?: string;
}

export const WorldNews: FC<WorldNewsProps> = ({
  articles,
  title = 'World News',
}) => (
  <section data-testid="world-news" className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <article
          key={index}
          className="card bg-base-200 border-base-content/10 overflow-hidden rounded-xl border">
          <div
            role="img"
            aria-label={article.imageAlt}
            className="from-primary to-info h-40 w-full bg-gradient-to-br"
          />
          <div className="card-body">
            <span className="badge badge-info badge-sm w-fit">
              {article.region}
            </span>
            <h3 className="card-title">{article.title}</h3>
            <p className="text-base-content/60 text-sm">{article.excerpt}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);
