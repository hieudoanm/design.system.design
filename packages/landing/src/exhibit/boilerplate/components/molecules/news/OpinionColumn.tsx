import type { FC } from 'react';

interface Columnist {
  id: string;
  name: string;
  headline: string;
  excerpt?: string;
  href?: string;
}

interface OpinionColumnProps {
  columnists: Columnist[];
  title?: string;
}

export const OpinionColumn: FC<OpinionColumnProps> = ({
  columnists,
  title = 'Opinion',
}) => (
  <aside
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="opinion-column">
    <div className="card-body gap-4">
      <h2 className="card-title text-base">{title}</h2>
      {columnists.length === 0 ? (
        <p className="text-base-content/50 text-sm">No opinions yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {columnists.map((columnist) => (
            <li key={columnist.id} className="flex flex-col gap-1">
              <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                {columnist.name}
              </span>
              {columnist.href ? (
                <a
                  href={columnist.href}
                  className="link link-hover text-sm font-medium">
                  {columnist.headline}
                </a>
              ) : (
                <h3 className="text-sm font-medium">{columnist.headline}</h3>
              )}
              {columnist.excerpt && (
                <p className="text-base-content/70 text-sm">
                  {columnist.excerpt}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  </aside>
);
