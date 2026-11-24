import type { FC } from 'react';

interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'done' | 'current' | 'upcoming';
}

interface ProjectTimelineProps {
  milestones: Milestone[];
}

const MARKER: Record<Milestone['status'], string> = {
  done: 'border-success bg-success',
  current: 'border-primary bg-primary',
  upcoming: 'border-base-300 bg-base-300',
};

const LABEL: Record<Milestone['status'], string> = {
  done: 'badge-success',
  current: 'badge-primary',
  upcoming: 'badge-ghost',
};

export const ProjectTimeline: FC<ProjectTimelineProps> = ({ milestones }) => (
  <section
    data-testid="project-timeline"
    className="card bg-base-100 border-base-200 border shadow-sm">
    <div className="card-body">
      <h3 className="card-title text-base">Project timeline</h3>
      {milestones.length === 0 && (
        <p
          data-testid="timeline-empty"
          className="text-base-content/40 py-4 text-center text-sm">
          No milestones scheduled.
        </p>
      )}
      <ol className="flex flex-col">
        {milestones.map((milestone, index) => (
          <li key={milestone.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < milestones.length - 1 && (
              <span className="border-base-content/20 absolute top-3 left-[5px] h-full border-l" />
            )}
            <span
              className={`z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${MARKER[milestone.status]}`}
            />
            <div className="flex flex-1 items-start justify-between gap-3">
              <div>
                <p
                  className={`text-sm ${
                    milestone.status === 'upcoming'
                      ? 'text-base-content/50'
                      : 'font-medium'
                  }`}>
                  {milestone.title}
                </p>
                <span className="text-base-content/40 text-xs">
                  {milestone.date}
                </span>
              </div>
              <span className={`badge badge-sm ${LABEL[milestone.status]}`}>
                {milestone.status}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
