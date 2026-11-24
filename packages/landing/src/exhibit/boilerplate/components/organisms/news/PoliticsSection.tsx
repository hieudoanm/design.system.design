import type { FC } from 'react';

interface PoliticsArticle {
  title: string;
  category: string;
  imageAlt: string;
}

interface PoliticsPoll {
  question: string;
  yes: number;
  no: number;
}

interface PoliticsSectionProps {
  lead: PoliticsArticle;
  articles: PoliticsArticle[];
  poll?: PoliticsPoll;
  title?: string;
}

export const PoliticsSection: FC<PoliticsSectionProps> = ({
  lead,
  articles,
  poll,
  title = 'Politics',
}) => {
  const total = poll ? poll.yes + poll.no : 0;
  const yesShare = poll && total > 0 ? Math.round((poll.yes / total) * 100) : 0;

  return (
    <section
      data-testid="politics-section"
      className="flex w-full flex-col gap-4">
      <h2>{title}</h2>
      <article className="card bg-base-200 border-base-content/10 overflow-hidden rounded-xl border">
        <div
          role="img"
          aria-label={lead.imageAlt}
          className="from-primary to-error h-48 w-full bg-gradient-to-br"
        />
        <div className="card-body">
          <span className="badge badge-error badge-sm w-fit">
            {lead.category}
          </span>
          <h3 className="text-2xl">{lead.title}</h3>
        </div>
      </article>
      <ul className="flex flex-col gap-2">
        {articles.map((article, index) => (
          <li
            key={index}
            className="border-base-content/10 flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{article.title}</span>
              <span className="badge badge-ghost badge-sm w-fit">
                {article.category}
              </span>
            </div>
            <span className="text-base-content/40 text-2xl" aria-hidden="true">
              {'\u2192'}
            </span>
          </li>
        ))}
      </ul>
      {poll && (
        <div className="card bg-base-200 border-base-content/10 rounded-xl border p-4">
          <h4 className="card-title text-sm">{poll.question}</h4>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span>Yes</span>
              <span className="font-mono">{poll.yes}</span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={yesShare}
              max={100}
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>No</span>
              <span className="font-mono">{poll.no}</span>
            </div>
            <progress
              className="progress progress-error w-full"
              value={100 - yesShare}
              max={100}
            />
          </div>
        </div>
      )}
    </section>
  );
};
