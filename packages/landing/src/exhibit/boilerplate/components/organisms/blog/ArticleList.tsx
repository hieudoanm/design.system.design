import type { FC } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  author?: string;
  tag?: string;
}

interface ArticleListProps {
  articles: Article[];
  title?: string;
}

export const ArticleList: FC<ArticleListProps> = ({
  articles,
  title = 'Latest articles',
}) => (
  <section className="py-6">
    <h2 className="mb-4 text-xl">{title}</h2>
    <ol className="flex flex-col gap-3">
      {articles.length === 0 && (
        <li className="text-base-content/50 text-sm">No articles yet.</li>
      )}
      {articles.map((article) => (
        <li
          key={article.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base">{article.title}</h3>
              {article.excerpt && (
                <p className="text-base-content/50 mt-1 text-sm">
                  {article.excerpt}
                </p>
              )}
              <div className="text-base-content/40 mt-2 flex items-center gap-3 text-xs">
                {article.author && <span>{article.author}</span>}
                {article.date && <time>{article.date}</time>}
              </div>
            </div>
            {article.tag && (
              <span className="badge badge-ghost badge-sm shrink-0">
                {article.tag}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  </section>
);
