import type { FC } from 'react';

interface CurriculumItem {
  id: string;
  title: string;
  description?: string;
  duration?: string;
}

interface CourseLandingProps {
  title: string;
  description?: string;
  instructor?: string;
  rating?: number;
  curriculum: CurriculumItem[];
  ctaLabel?: string;
}

export const CourseLanding: FC<CourseLandingProps> = ({
  title,
  description,
  instructor,
  rating,
  curriculum,
  ctaLabel = 'Enroll now',
}) => (
  <section className="py-8">
    <div className="card bg-base-200 border-base-content/10 rounded-xl border">
      <div className="card-body">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl">{title}</h2>
            {description && (
              <p className="text-base-content/60 mt-2">{description}</p>
            )}
            <div className="text-base-content/50 mt-3 flex items-center gap-4 text-sm">
              {instructor && <span>By {instructor}</span>}
              {rating !== undefined && <span>⭐ {rating}/5</span>}
            </div>
            <a className="btn btn-primary mt-4" href="#enroll">
              {ctaLabel}
            </a>
          </div>
          <div>
            <h3 className="text-lg">Curriculum</h3>
            <ol className="mt-3 flex flex-col gap-2">
              {curriculum.map((item, index) => (
                <li
                  key={item.id}
                  className="bg-base-100 border-base-content/10 flex items-start gap-3 rounded-xl border p-3">
                  <span className="text-primary font-mono text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    {item.description && (
                      <p className="text-base-content/50 text-xs">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.duration && (
                    <span className="badge badge-ghost badge-sm ml-auto">
                      {item.duration}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  </section>
);
