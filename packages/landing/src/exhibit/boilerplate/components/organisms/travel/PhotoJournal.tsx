import type { FC } from 'react';

interface JournalEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  caption?: string;
  likes: number;
}

interface PhotoJournalProps {
  entries: JournalEntry[];
}

export const PhotoJournal: FC<PhotoJournalProps> = ({ entries }) => {
  return (
    <section data-testid="photo-journal" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Photo journal</h2>
        <span className="badge badge-ghost">{entries.length} entries</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <article key={entry.id} className="card bg-base-200">
            <figure className="bg-primary/20 relative flex aspect-square items-center justify-center">
              <span
                className="text-base-content/30 text-4xl"
                aria-hidden="true">
                &#128247;
              </span>
              <span
                className="badge badge-primary absolute top-2 right-2"
                aria-hidden="true">
                &#10084; {entry.likes}
              </span>
            </figure>
            <div className="card-body gap-1 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{entry.title}</h3>
                <span className="text-base-content/50 text-xs">
                  {entry.date}
                </span>
              </div>
              <p className="text-base-content/50 text-xs">{entry.location}</p>
              {entry.caption && (
                <p className="text-base-content/70 text-sm">{entry.caption}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
