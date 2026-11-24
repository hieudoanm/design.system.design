import type { FC } from 'react';

interface Guide {
  id: string;
  name: string;
  city: string;
  languages: string[];
  rating: number;
  trips: number;
}

interface LocalGuidesProps {
  guides: Guide[];
}

export const LocalGuides: FC<LocalGuidesProps> = ({ guides }) => {
  return (
    <section data-testid="local-guides" className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Local guides</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <article key={guide.id} className="card bg-base-200">
            <div className="card-body gap-2 p-4">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content w-12 rounded-full">
                    <span className="text-base">{guide.name.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">{guide.name}</h3>
                  <p className="text-base-content/50 text-xs">{guide.city}</p>
                </div>
              </div>
              <p
                className="text-warning text-sm"
                aria-label={`${guide.rating} star rating`}>
                {'★'.repeat(guide.rating)}
                {'☆'.repeat(Math.max(0, 5 - guide.rating))}
              </p>
              <p className="text-base-content/50 text-xs">
                {guide.trips} trips hosted
              </p>
              <div className="flex flex-wrap gap-1">
                {guide.languages.map((language) => (
                  <span key={language} className="badge badge-outline badge-sm">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
