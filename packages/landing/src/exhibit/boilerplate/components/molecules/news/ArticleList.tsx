import type { FC } from 'react';

interface ArticleListItem {
  id: string;
  title: string;
  section?: string;
  excerpt?: string;
  href?: string;
}

interface ArticleListProps {
  articles: ArticleListItem[];
  title?: string;
}

export const ArticleList: FC<ArticleListProps> = ({ articles, title }) => (
  <section className="card card-bordered border-base-300 bg-base-200">
    <div className="card-body gap-4">
      {title && <h2 className="card-title text-base">{title}</h2>}
      {articles.length === 0 ? (
        <p className="text-base-content/50 text-sm">No articles yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {articles.map((article) => (
            <li key={article.id} className="flex flex-col gap-1">
              {article.section && (
                <span className="badge badge-ghost badge-xs w-fit">
                  {article.section}
                </span>
              )}
              {article.href ? (
                <a href={article.href} className="link link-hover font-medium">
                  {article.title}
                </a>
              ) : (
                <h3 className="text-sm font-medium">{article.title}</h3>
              )}
              {article.excerpt && (
                <p className="text-base-content/70 text-sm">
                  {article.excerpt}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);
