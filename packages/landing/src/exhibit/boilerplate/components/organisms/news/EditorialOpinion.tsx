import type { FC } from 'react';

interface OpinionColumn {
  author: string;
  role: string;
  initials: string;
  title: string;
  excerpt: string;
}

interface EditorialOpinionProps {
  columns: OpinionColumn[];
  title?: string;
}

export const EditorialOpinion: FC<EditorialOpinionProps> = ({
  columns,
  title = 'Editorial & Opinion',
}) => (
  <section
    data-testid="editorial-opinion"
    className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {columns.map((column, index) => (
        <article
          key={index}
          className="card bg-base-200 border-base-content/10 rounded-xl border p-5">
          <div className="avatar placeholder mb-3">
            <div className="bg-primary/20 text-primary w-12 rounded-full">
              <span className="font-mono text-sm">{column.initials}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{column.author}</span>
            <span className="badge badge-outline badge-sm">{column.role}</span>
          </div>
          <h3 className="card-title mt-3">{column.title}</h3>
          <p className="text-base-content/60 text-sm">{column.excerpt}</p>
        </article>
      ))}
    </div>
  </section>
);
