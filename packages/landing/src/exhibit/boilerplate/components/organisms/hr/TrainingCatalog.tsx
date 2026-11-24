import type { FC } from 'react';

interface Course {
  id: string;
  title: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  enrolled: number;
}

interface TrainingCatalogProps {
  courses: Course[];
}

const levelClass: Record<Course['level'], string> = {
  beginner: 'badge-success',
  intermediate: 'badge-warning',
  advanced: 'badge-error',
};

export const TrainingCatalog: FC<TrainingCatalogProps> = ({ courses }) => (
  <div
    className="grid w-full grid-cols-1 gap-4 md:grid-cols-3"
    data-testid="training-catalog">
    {courses.map((course) => (
      <article
        key={course.id}
        className="card bg-base-200 border-base-content/10 border">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <span className="badge badge-ghost badge-sm">
              {course.category}
            </span>
            <span className={`badge badge-sm ${levelClass[course.level]}`}>
              {course.level}
            </span>
          </div>
          <h3 className="card-title text-base">{course.title}</h3>
          <div className="text-base-content/60 flex gap-4 text-sm">
            <span>{course.duration}</span>
            <span>{course.enrolled} enrolled</span>
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-outline btn-primary btn-sm">
              Enroll
            </button>
          </div>
        </div>
      </article>
    ))}
    {courses.length === 0 && (
      <div className="card bg-base-200 border-base-content/10 col-span-full border">
        <div className="card-body text-center">
          <p className="text-base-content/40 text-sm">No courses available</p>
        </div>
      </div>
    )}
  </div>
);

TrainingCatalog.displayName = 'TrainingCatalog';
