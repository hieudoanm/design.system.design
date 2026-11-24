import type { FC } from 'react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  score: number;
}

interface PipelineStage {
  id: string;
  title: string;
  candidates: Candidate[];
}

interface CandidatePipelineProps {
  stages: PipelineStage[];
}

const scoreClass = (score: number): string => {
  if (score >= 80) return 'badge-success';
  if (score >= 60) return 'badge-warning';
  return 'badge-error';
};

export const CandidatePipeline: FC<CandidatePipelineProps> = ({ stages }) => (
  <div
    className="flex w-full gap-4 overflow-x-auto pb-2"
    data-testid="candidate-pipeline">
    {stages.map((stage) => (
      <section
        key={stage.id}
        aria-label={stage.title}
        className="bg-base-200 flex w-64 shrink-0 flex-col gap-2 rounded-xl p-3">
        <header className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium">{stage.title}</h3>
          <span className="badge badge-ghost badge-sm">
            {stage.candidates.length}
          </span>
        </header>
        <div className="flex min-h-16 flex-col gap-2">
          {stage.candidates.length === 0 && (
            <p className="text-base-content/40 text-center text-sm">Empty</p>
          )}
          {stage.candidates.map((candidate) => (
            <article
              key={candidate.id}
              className="bg-base-100 border-base-content/10 flex flex-col gap-1 rounded-xl border p-3 shadow-sm">
              <h4 className="text-sm font-medium">{candidate.name}</h4>
              <p className="text-base-content/60 text-sm">{candidate.role}</p>
              <span
                className={`badge badge-sm w-fit ${scoreClass(candidate.score)}`}>
                Score {candidate.score}
              </span>
            </article>
          ))}
        </div>
      </section>
    ))}
  </div>
);

CandidatePipeline.displayName = 'CandidatePipeline';
