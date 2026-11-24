import type { CSSProperties, FC } from 'react';

interface RingStyle extends CSSProperties {
  '--value'?: number;
}

interface WellnessFactor {
  label: string;
  value: number;
}

interface WellnessScoreProps {
  score: number;
  factors: WellnessFactor[];
  title?: string;
}

const scoreLabel = (score: number): string => {
  if (score >= 80) return 'Thriving';
  if (score >= 60) return 'Balanced';
  if (score >= 40) return 'Struggling';
  return 'At risk';
};

export const WellnessScore: FC<WellnessScoreProps> = ({
  score,
  factors,
  title = 'Wellness score',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <h3 className="card-title">{title}</h3>
      <div className="flex items-center justify-center gap-6">
        <div
          className="radial-progress text-primary"
          style={{ '--value': score } as RingStyle}
          data-testid="score-ring">
          {score}
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-light" data-testid="score-label">
            {scoreLabel(score)}
          </span>
          <span className="text-base-content/50 text-sm">Overall wellness</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {factors.map((factor) => (
          <li key={factor.label}>
            <div className="flex items-center justify-between text-sm">
              <span>{factor.label}</span>
              <span className="text-base-content/60">{factor.value}/100</span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={factor.value}
              max={100}
            />
          </li>
        ))}
      </ul>
    </div>
  </section>
);
