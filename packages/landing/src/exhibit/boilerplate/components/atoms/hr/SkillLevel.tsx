import type { FC } from 'react';

interface SkillLevelProps {
  skill: string;
  level: number;
  max?: number;
}

export const SkillLevel: FC<SkillLevelProps> = ({ skill, level, max = 5 }) => {
  const clamped = Math.max(0, Math.min(level, max));
  return (
    <div data-testid="skill-level" className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span>{skill}</span>
        <span className="text-base-content/50">
          {clamped}/{max}
        </span>
      </div>
      <progress
        className="progress progress-primary w-full"
        value={clamped}
        max={max}
        aria-label={`${skill} level`}
      />
    </div>
  );
};
